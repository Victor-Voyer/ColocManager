import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import * as expenseApi from '../../api/expenseApi'
import * as taskApi from '../../api/taskApi'
import { useAuth } from '../../context/AuthContext'
import { formatAmount } from '../../utils/expenseUtils'
import './Dashboard.css'

function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const colocationId = user?.colocation?.id

  const [balances, setBalances] = useState(null)
  const [pendingTasks, setPendingTasks] = useState(0)
  const [isLoading, setIsLoading] = useState(Boolean(colocationId))
  const [error, setError] = useState('')

  useEffect(() => {
    if (!colocationId) {
      setIsLoading(false)
      return
    }

    let cancelled = false

    const loadDashboard = async () => {
      setIsLoading(true)
      setError('')

      try {
        const [balanceData, taskData] = await Promise.all([
          expenseApi.getBalances(colocationId),
          taskApi.listTasks(colocationId, { status: 'pending' }),
        ])

        if (!cancelled) {
          setBalances(balanceData)
          setPendingTasks(Array.isArray(taskData.items) ? taskData.items.length : 0)
        }
      } catch {
        if (!cancelled) {
          setError('Impossible de charger le tableau de bord.')
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    loadDashboard()

    return () => {
      cancelled = true
    }
  }, [colocationId])

  const userBalance = useMemo(() => {
    if (!balances?.members || !user?.id) {
      return null
    }

    return balances.members.find((member) => member.userId === user.id) ?? null
  }, [balances, user?.id])

  const totalExpenses = useMemo(() => {
    if (!balances?.members) {
      return '0.00'
    }

    const totalCents = balances.members.reduce(
      (sum, member) => sum + Math.round(Number(member.totalPaid) * 100),
      0,
    )

    return (totalCents / 100).toFixed(2)
  }, [balances])

  const owedToYou = userBalance && Number(userBalance.balance) > 0
    ? userBalance.balance
    : '0.00'

  const youOwe = userBalance && Number(userBalance.balance) < 0
    ? Math.abs(Number(userBalance.balance)).toFixed(2)
    : '0.00'

  const stats = [
    {
      label: 'Total des dépenses',
      value: `${formatAmount(totalExpenses)}`,
      trend: colocationId ? 'Toutes dépenses enregistrées' : 'Rejoignez une colocation',
      trendColor: 'green',
    },
    {
      label: 'On vous doit',
      value: `${formatAmount(owedToYou)}`,
      trend: Number(owedToYou) > 0 ? 'Solde positif' : 'Rien à percevoir',
      trendColor: 'green',
    },
    {
      label: 'Vous devez',
      value: `${formatAmount(youOwe)}`,
      trend: Number(youOwe) > 0 ? 'Dettes actives' : 'Rien à rembourser',
      trendColor: Number(youOwe) > 0 ? 'red' : 'green',
    },
    {
      label: 'Tâches en attente',
      value: String(pendingTasks),
      trend: pendingTasks > 0 ? 'À planifier ou terminer' : 'Aucune tâche en attente',
      trendColor: pendingTasks > 0 ? 'orange' : 'green',
    },
  ]

  return (
    <div className="dashboard-content">
      <div className="dashboard-content__greeting">
        <div className="dashboard-content__greeting-text">
          <h1>
            Bonjour, {user?.firstName?.[0]?.toUpperCase()}
            {user?.firstName?.slice(1)}
          </h1>
          <p>Vue d&apos;ensemble de votre colocation</p>
        </div>
        <div className="dashboard-content__greeting-actions">
          {!user?.colocation && (
            <button
              type="button"
              className="dashboard-content__btn dashboard-content__btn--neutral"
              onClick={() => navigate('/collocations')}
            >
              Créer ou rejoindre une colocation
            </button>
          )}

          {colocationId && (
            <button
              type="button"
              className="dashboard-content__btn dashboard-content__btn--primary"
              onClick={() => navigate('/expenses')}
            >
              + Ajouter une dépense
            </button>
          )}
        </div>
      </div>

      {error && (
        <p className="alert--error" role="alert">
          {error}
        </p>
      )}

      {isLoading ? (
        <p className="page-status">Chargement du tableau de bord…</p>
      ) : (
        <div className="dashboard-content__stats-grid">
          {stats.map((stat) => (
            <div key={stat.label} className="dashboard-content__stat-card">
              <div className="dashboard-content__stat-body">
                <span className="dashboard-content__stat-label">{stat.label}</span>
                <span className="dashboard-content__stat-value">{stat.value}</span>
                <span
                  className={`dashboard-content__stat-trend dashboard-content__stat-trend--${stat.trendColor}`}
                >
                  {stat.trend}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {colocationId && balances?.members?.length > 0 && (
        <section className="dashboard-content__balances card">
          <h2>Soldes par membre</h2>
          <ul className="dashboard-content__balance-list">
            {balances.members.map((member) => (
              <li key={member.userId} className="dashboard-content__balance-item">
                <span>
                  {member.firstName} {member.lastName}
                </span>
                <strong>{formatAmount(member.balance)}</strong>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

export default Dashboard
