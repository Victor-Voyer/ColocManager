import { useMemo } from 'react'
import { Link } from 'react-router'
import { useAuth } from '../../context/AuthContext'
import { useDashboard } from '../../hooks/useDashboard'
import { formatAmount, formatMemberName } from '../../utils/expenseUtils'
import {
  formatRelativeTime,
  localDateKey,
  localMonthKey,
} from '../../utils/dashboardUtils'
import './Dashboard.css'

const CATEGORY_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6']

function useDashboardStats(expenses, tasks, currentUserId) {
  return useMemo(() => {
    const thisMonthKey = localMonthKey()
    const lastMonthDate = new Date()
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1)
    const lastMonthKey = localMonthKey(lastMonthDate)
    const todayKey = localDateKey()

    let totalThisMonth = 0
    let totalLastMonth = 0
    let youAreOwed = 0
    let youOwe = 0
    const owedByNames = new Set()
    const oweToNames = new Set()

    expenses.forEach((expense) => {
      const monthKey = expense.expenseDate?.slice(0, 7)
      const amount = Number(expense.amount)
      if (monthKey === thisMonthKey) {
        totalThisMonth += amount
      }
      if (monthKey === lastMonthKey) {
        totalLastMonth += amount
      }

      const isPayer = expense.paidBy?.id === currentUserId

      expense.shares?.forEach((share) => {
        if (share.isPaid) {
          return
        }

        if (isPayer && share.userId !== currentUserId) {
          youAreOwed += Number(share.amountOwed)
          owedByNames.add(formatMemberName(share))
        } else if (!isPayer && share.userId === currentUserId && expense.paidBy) {
          youOwe += Number(share.amountOwed)
          oweToNames.add(formatMemberName(expense.paidBy))
        }
      })
    })

    const pendingTasks = tasks.filter((task) => task.status !== 'done')
    const dueTodayCount = pendingTasks.filter(
      (task) => task.dueDate === todayKey,
    ).length

    const trend =
      totalLastMonth > 0
        ? Math.round(((totalThisMonth - totalLastMonth) / totalLastMonth) * 100)
        : null

    return {
      totalThisMonth,
      trend,
      youAreOwed,
      youOwe,
      owedByNames: [...owedByNames],
      oweToNames: [...oweToNames],
      pendingTasksCount: pendingTasks.length,
      dueTodayCount,
    }
  }, [expenses, tasks, currentUserId])
}

function useCategoryBreakdown(expenses) {
  return useMemo(() => {
    const thisMonthKey = localMonthKey()
    const totals = new Map()

    expenses
      .filter((expense) => expense.expenseDate?.slice(0, 7) === thisMonthKey)
      .forEach((expense) => {
        const label = expense.category?.trim() || 'Sans catégorie'
        totals.set(label, (totals.get(label) ?? 0) + Number(expense.amount))
      })

    const entries = [...totals.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6)
    const max = Math.max(...entries.map(([, amount]) => amount), 0)

    return entries.map(([label, amount], index) => ({
      label,
      amount,
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
      heightPct: max > 0 ? Math.max((amount / max) * 100, 6) : 0,
    }))
  }, [expenses])
}

function useRecentActivity(expenses, taskHistory) {
  return useMemo(() => {
    const items = []

    expenses.forEach((expense) => {
      if (expense.paidBy && expense.createdAt) {
        items.push({
          key: `expense-${expense.id}`,
          user: formatMemberName(expense.paidBy),
          action: 'a ajouté une dépense',
          target: expense.description,
          amount: formatAmount(expense.amount),
          time: expense.createdAt,
          icon: '💳',
          iconBg: 'rgba(59, 130, 246, 0.1)',
        })
      }

      expense.shares?.forEach((share) => {
        if (share.isPaid && share.paidAt) {
          items.push({
            key: `share-${expense.id}-${share.userId}`,
            user: formatMemberName(share),
            action: 'a payé sa part de',
            target: expense.description,
            amount: formatAmount(share.amountOwed),
            time: share.paidAt,
            icon: '✅',
            iconBg: 'rgba(16, 185, 129, 0.1)',
          })
        }
      })
    })

    taskHistory.forEach((task) => {
      if (task.completedAt) {
        items.push({
          key: `task-${task.id}`,
          user: formatMemberName(task.assignedTo ?? task.createdBy),
          action: 'a terminé la tâche',
          target: task.title,
          amount: null,
          time: task.completedAt,
          icon: '🧹',
          iconBg: 'rgba(139, 92, 246, 0.1)',
        })
      }
    })

    return items.sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 6)
  }, [expenses, taskHistory])
}

function Dashboard() {
  const { user } = useAuth()
  const colocationId = user?.colocation?.id

  const { expenses, tasks, taskHistory, isLoading, error } = useDashboard(colocationId)
  const stats = useDashboardStats(expenses, tasks, user?.id)
  const categoryBreakdown = useCategoryBreakdown(expenses)
  const recentActivity = useRecentActivity(expenses, taskHistory)

  const statCards = [
    {
      label: 'Dépenses ce mois-ci',
      value: formatAmount(stats.totalThisMonth),
      trend:
        stats.trend === null
          ? 'Pas de données le mois dernier'
          : `${stats.trend > 0 ? '+' : ''}${stats.trend}% vs mois dernier`,
      trendColor: stats.trend === null ? 'orange' : stats.trend > 0 ? 'red' : 'green',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
      iconBg: 'rgba(59, 130, 246, 0.1)',
      iconColor: '#3B82F6',
    },
    {
      label: 'On vous doit',
      value: formatAmount(stats.youAreOwed),
      trend:
        stats.owedByNames.length > 0
          ? `${stats.owedByNames.length} colocataire(s) vous doivent`
          : 'Aucune dette en cours',
      trendColor: 'green',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m7 10 5 5 5-5" />
          <path d="M12 15V3" />
        </svg>
      ),
      iconBg: 'rgba(16, 185, 129, 0.1)',
      iconColor: '#10B981',
    },
    {
      label: 'Vous devez',
      value: formatAmount(stats.youOwe),
      trend:
        stats.oweToNames.length > 0
          ? `À ${stats.oweToNames.join(' & ')}`
          : 'Rien à rembourser',
      trendColor: stats.youOwe > 0 ? 'red' : 'green',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m17 14-5-5-5 5" />
          <path d="M12 9v12" />
        </svg>
      ),
      iconBg: 'rgba(239, 68, 68, 0.1)',
      iconColor: '#EF4444',
    },
    {
      label: 'Tâches en attente',
      value: String(stats.pendingTasksCount),
      trend:
        stats.dueTodayCount > 0
          ? `${stats.dueTodayCount} tâche(s) pour aujourd'hui`
          : "Rien pour aujourd'hui",
      trendColor: 'orange',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
      ),
      iconBg: 'rgba(245, 158, 11, 0.1)',
      iconColor: '#F59E0B',
    },
  ]

  if (!colocationId) {
    return (
      <div className="dashboard-content">
        <div className="dashboard-content__greeting">
          <div className="dashboard-content__greeting-text">
            <h1>Bonjour, {user?.firstName} 👋</h1>
            <p>Rejoignez ou créez une colocation pour voir votre tableau de bord.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-content">
      <div className="dashboard-content__greeting">
        <div className="dashboard-content__greeting-text">
          <h1>Bonjour, {user?.firstName} 👋</h1>
          <p>Voici ce qu&apos;il se passe dans votre foyer aujourd&apos;hui.</p>
        </div>
        <div className="dashboard-content__greeting-actions">
          <Link
            to="/settings"
            className="dashboard-content__btn dashboard-content__btn--neutral"
          >
            Gérer le foyer
          </Link>
          <Link
            to="/expenses"
            className="dashboard-content__btn dashboard-content__btn--primary"
          >
            + Ajouter une dépense
          </Link>
        </div>
      </div>

      {error && (
        <p className="dashboard-content__error" role="alert">
          {error}
        </p>
      )}

      {isLoading ? (
        <p>Chargement du tableau de bord…</p>
      ) : (
        <>
          <div className="dashboard-content__stats-grid">
            {statCards.map((stat) => (
              <div key={stat.label} className="dashboard-content__stat-card">
                <div className="dashboard-content__stat-header">
                  <div
                    className="dashboard-content__stat-icon"
                    style={{ backgroundColor: stat.iconBg, color: stat.iconColor }}
                  >
                    {stat.icon}
                  </div>
                </div>
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

          <div className="dashboard-content__main-grid">
            <section className="dashboard-content__chart-section">
              <div className="dashboard-content__section-header">
                <h2>Répartition des dépenses</h2>
                <select className="dashboard-content__select" disabled>
                  <option>Ce mois-ci</option>
                </select>
              </div>
              <div className="dashboard-content__chart-container">
                {categoryBreakdown.length === 0 ? (
                  <p>Aucune dépense ce mois-ci.</p>
                ) : (
                  <div className="dashboard-content__bar-chart">
                    {categoryBreakdown.map((category) => (
                      <div key={category.label} className="dashboard-content__bar-item">
                        <div
                          className="dashboard-content__bar"
                          style={{
                            height: `${category.heightPct}%`,
                            backgroundColor: category.color,
                          }}
                        />
                        <span>{category.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <section className="dashboard-content__activity-section">
              <div className="dashboard-content__section-header">
                <h2>Activité récente</h2>
              </div>
              <div className="dashboard-content__activity-list">
                {recentActivity.length === 0 ? (
                  <p>Aucune activité récente.</p>
                ) : (
                  recentActivity.map((activity) => (
                    <div key={activity.key} className="dashboard-content__activity-item">
                      <div
                        className="dashboard-content__activity-icon"
                        style={{ backgroundColor: activity.iconBg }}
                      >
                        {activity.icon}
                      </div>
                      <div className="dashboard-content__activity-content">
                        <p>
                          <strong>{activity.user}</strong> {activity.action}{' '}
                          <span className="dashboard-content__activity-target">
                            {activity.target}
                          </span>
                        </p>
                        <span className="dashboard-content__activity-time">
                          🕒 {formatRelativeTime(activity.time)}
                          {activity.amount && (
                            <span> • <strong>{activity.amount}</strong></span>
                          )}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  )
}

export default Dashboard
