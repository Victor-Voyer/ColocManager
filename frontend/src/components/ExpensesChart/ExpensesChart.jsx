import {Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,} from 'recharts'
import { formatAmount } from '../../utils/expenseUtils'
import './ExpensesChart.css'

function ExpensesChart({ statistics = [] }) {
  const chartData = statistics.map((item) => ({
    month: item.month,
    total: Number(item.total),
  }))

  if (chartData.length === 0) {
    return null
  }

  return (
    <section className="expenses-chart card">
      <h2>Dépenses mensuelles du foyer</h2>

      <div className="expenses-chart__container">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />

            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value} €`}
            />

            <Tooltip
              formatter={(value) => [
                formatAmount(value),
                'Dépenses',
              ]}
            />

            <Bar
              dataKey="total"
              fill="#6366f1"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}

export default ExpensesChart
