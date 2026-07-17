import { useNavigate } from 'react-router'
import './Dashboard.css'
import { useAuth } from '../../context/AuthContext'

const stats = [
  {
    label: 'Total Expenses',
    value: '1,845.00€',
    trend: '+12% from last month',
    trendColor: 'green',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    iconBg: 'rgba(59, 130, 246, 0.1)',
    iconColor: '#3B82F6',
  },
  {
    label: 'You are owed',
    value: '240.50€',
    trend: '3 roommates owe you',
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
    label: 'You owe',
    value: '45.00€',
    trend: 'To Sarah & Mark',
    trendColor: 'red',
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
    label: 'Pending Tasks',
    value: '12',
    trend: '3 tasks due today',
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

const recentActivity = [
  {
    user: 'Alex',
    action: 'added a new expense',
    target: 'Weekly Groceries',
    time: '2H AGO',
    amount: '84.50€',
    icon: '💳',
    iconBg: 'rgba(59, 130, 246, 0.1)',
  },
  {
    user: 'Sarah',
    action: 'completed a task',
    target: 'Clean the kitchen',
    time: '5H AGO',
    icon: '✅',
    iconBg: 'rgba(16, 185, 129, 0.1)',
  },
  {
    user: 'Alex',
    paid: true,
    action: 'paid for',
    target: 'Electricity bill',
    time: 'YESTERDAY',
    amount: '120.00€',
    icon: '💳',
    iconBg: 'rgba(59, 130, 246, 0.1)',
  },
]

function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <div className="dashboard-content">
      <div className="dashboard-content__greeting">
        <div className="dashboard-content__greeting-text">
          <h1>Bonjour, {user?.firstName?.[0].toUpperCase() + user?.firstName?.slice(1)}</h1>
          <p>Voici quelques actualités</p>
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

          <button className="dashboard-content__btn dashboard-content__btn--primary">+ Add Expense</button>
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
