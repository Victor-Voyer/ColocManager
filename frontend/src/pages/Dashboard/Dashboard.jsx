import { useNavigate } from 'react-router'
import './Dashboard.css'

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

  return (
    <div className="dashboard-content">
      <div className="dashboard-content__greeting">
        <div className="dashboard-content__greeting-text">
          <h1>Bonjour, Alex 👋</h1>
          <p>Here&apos;s what&apos;s happening in your flat today.</p>
        </div>
        <div className="dashboard-content__greeting-actions">
          <button
            type="button"
            className="dashboard-content__btn dashboard-content__btn--neutral"
            onClick={() => navigate('/collocations')}
          >
            Créer ou rejoindre une colocation
          </button>
          <button className="dashboard-content__btn dashboard-content__btn--primary">+ Add Expense</button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="dashboard-content__stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="dashboard-content__stat-card">
            <div className="dashboard-content__stat-header">
              <div
                className="dashboard-content__stat-icon"
                style={{ backgroundColor: stat.iconBg, color: stat.iconColor }}
              >
                {stat.icon}
              </div>
              <span className="dashboard-content__stat-arrow">→</span>
            </div>
            <div className="dashboard-content__stat-body">
              <span className="dashboard-content__stat-label">{stat.label}</span>
              <span className="dashboard-content__stat-value">{stat.value}</span>
              <span className={`dashboard-content__stat-trend dashboard-content__stat-trend--${stat.trendColor}`}>
                {stat.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="dashboard-content__main-grid">
        {/* Expense Distribution */}
        <section className="dashboard-content__chart-section">
          <div className="dashboard-content__section-header">
            <h2>Expense Distribution</h2>
            <select className="dashboard-content__select">
              <option>This Month</option>
            </select>
          </div>
          <div className="dashboard-content__chart-container">
            <div className="dashboard-content__bar-chart">
              <div className="dashboard-content__bar-item">
                <div className="dashboard-content__bar dashboard-content__bar--rent" style={{ height: '90%' }} />
                <span>Rent</span>
              </div>
              <div className="dashboard-content__bar-item">
                <div className="dashboard-content__bar dashboard-content__bar--groceries" style={{ height: '40%' }} />
                <span>Groceries</span>
              </div>
              <div className="dashboard-content__bar-item">
                <div className="dashboard-content__bar dashboard-content__bar--electricity" style={{ height: '25%' }} />
                <span>Electricity</span>
              </div>
              <div className="dashboard-content__bar-item">
                <div className="dashboard-content__bar dashboard-content__bar--internet" style={{ height: '15%' }} />
                <span>Internet</span>
              </div>
              <div className="dashboard-content__bar-item">
                <div className="dashboard-content__bar dashboard-content__bar--water" style={{ height: '10%' }} />
                <span>Water</span>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Activity */}
        <section className="dashboard-content__activity-section">
          <div className="dashboard-content__section-header">
            <h2>Recent Activity</h2>
            <button className="dashboard-content__link-btn">View All</button>
          </div>
          <div className="dashboard-content__activity-list">
            {recentActivity.map((activity, index) => (
              <div key={index} className="dashboard-content__activity-item">
                <div className="dashboard-content__activity-icon" style={{ backgroundColor: activity.iconBg }}>
                  {activity.icon}
                </div>
                <div className="dashboard-content__activity-content">
                  <p>
                    <strong>{activity.user}</strong> {activity.action}{' '}
                    <span className="dashboard-content__activity-target">{activity.target}</span>
                  </p>
                  <span className="dashboard-content__activity-time">
                    🕒 {activity.time} {activity.amount && <span> • <strong>{activity.amount}</strong></span>}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

export default Dashboard
