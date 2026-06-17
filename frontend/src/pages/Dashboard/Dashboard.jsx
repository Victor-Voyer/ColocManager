import {
  DollarSign,
  ArrowDownLeft,
  ArrowUpRight,
  ListTodo,
  CreditCard,
  CircleCheck,
  ShoppingCart,
  Clock,
  ArrowRight,
  Hand,
} from 'lucide-react'
import './Dashboard.css'

const stats = [
  {
    label: 'Total Expenses',
    value: '1,845.00€',
    trend: '+12% from last month',
    trendColor: 'green',
    icon: DollarSign,
    iconBg: 'rgba(59, 130, 246, 0.1)',
    iconColor: '#3B82F6',
  },
  {
    label: 'You are owed',
    value: '240.50€',
    trend: '3 roommates owe you',
    trendColor: 'green',
    icon: ArrowDownLeft,
    iconBg: 'rgba(16, 185, 129, 0.1)',
    iconColor: '#10B981',
  },
  {
    label: 'You owe',
    value: '45.00€',
    trend: 'To Sarah & Mark',
    trendColor: 'red',
    icon: ArrowUpRight,
    iconBg: 'rgba(239, 68, 68, 0.1)',
    iconColor: '#EF4444',
  },
  {
    label: 'Pending Tasks',
    value: '12',
    trend: '3 tasks due today',
    trendColor: 'orange',
    icon: ListTodo,
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
    icon: CreditCard,
    iconBg: 'rgba(59, 130, 246, 0.1)',
  },
  {
    user: 'Sarah',
    action: 'completed a task',
    target: 'Clean the kitchen',
    time: '5H AGO',
    icon: CircleCheck,
    iconBg: 'rgba(16, 185, 129, 0.1)',
  },
  {
    user: 'Mark',
    action: 'added to shopping list',
    target: 'Dish soap',
    time: '8H AGO',
    icon: ShoppingCart,
    iconBg: 'rgba(245, 158, 11, 0.1)',
  },
  {
    user: 'Alex',
    paid: true,
    action: 'paid for',
    target: 'Electricity bill',
    time: 'YESTERDAY',
    amount: '120.00€',
    icon: CreditCard,
    iconBg: 'rgba(59, 130, 246, 0.1)',
  },
]

function Dashboard() {
  return (
    <div className="dashboard-content">
      <div className="dashboard-content__greeting">
        <div className="dashboard-content__greeting-text">
          <h1>
            Bonjour, Alex <Hand size={28} className="dashboard-content__wave" aria-hidden="true" />
          </h1>
          <p>Here&apos;s what&apos;s happening in your flat today.</p>
        </div>
        <div className="dashboard-content__greeting-actions">
          <button className="dashboard-content__btn dashboard-content__btn--neutral">Manage Flat</button>
          <button className="dashboard-content__btn dashboard-content__btn--primary">+ Add Expense</button>
        </div>
      </div>

      <div className="dashboard-content__stats-grid">
        {stats.map((stat) => {
          const StatIcon = stat.icon
          return (
            <div key={stat.label} className="dashboard-content__stat-card">
              <div className="dashboard-content__stat-header">
                <div
                  className="dashboard-content__stat-icon"
                  style={{ backgroundColor: stat.iconBg, color: stat.iconColor }}
                >
                  <StatIcon size={20} aria-hidden="true" />
                </div>
                <ArrowRight className="dashboard-content__stat-arrow" size={18} aria-hidden="true" />
              </div>
              <div className="dashboard-content__stat-body">
                <span className="dashboard-content__stat-label">{stat.label}</span>
                <span className="dashboard-content__stat-value">{stat.value}</span>
                <span className={`dashboard-content__stat-trend dashboard-content__stat-trend--${stat.trendColor}`}>
                  {stat.trend}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="dashboard-content__main-grid">
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

        <section className="dashboard-content__activity-section">
          <div className="dashboard-content__section-header">
            <h2>Recent Activity</h2>
            <button className="dashboard-content__link-btn">View All</button>
          </div>
          <div className="dashboard-content__activity-list">
            {recentActivity.map((activity) => {
              const ActivityIcon = activity.icon
              return (
                <div key={`${activity.user}-${activity.target}-${activity.time}`} className="dashboard-content__activity-item">
                  <div className="dashboard-content__activity-icon" style={{ backgroundColor: activity.iconBg }}>
                    <ActivityIcon size={18} aria-hidden="true" />
                  </div>
                  <div className="dashboard-content__activity-content">
                    <p>
                      <strong>{activity.user}</strong> {activity.action}{' '}
                      <span className="dashboard-content__activity-target">{activity.target}</span>
                    </p>
                    <span className="dashboard-content__activity-time">
                      <Clock size={14} aria-hidden="true" />
                      {activity.time}
                      {activity.amount && (
                        <span>
                          {' '}
                          • <strong>{activity.amount}</strong>
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}

export default Dashboard
