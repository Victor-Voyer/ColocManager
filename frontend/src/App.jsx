import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router'
import Homepage from './pages/Homepage/Homepage.jsx'
import Dashboard from './pages/Dashboard/Dashboard.jsx'
import Expenses from './pages/Expenses/Expenses.jsx'
import Tasks from './pages/Tasks/Tasks.jsx'
import ShoppingList from './pages/ShoppingList/ShoppingList.jsx'
import Settings from './pages/Settings/Settings.jsx'
import Layout from './components/Layout.jsx'

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<Homepage />} />

        {/* Dashboard Routes (Wrapped in Layout) */}
        <Route
          path="/dashboard"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />
        <Route
          path="/expenses"
          element={
            <Layout>
              <Expenses />
            </Layout>
          }
        />
        <Route
          path="/tasks"
          element={
            <Layout>
              <Tasks />
            </Layout>
          }
        />
        <Route
          path="/shopping"
          element={
            <Layout>
              <ShoppingList />
            </Layout>
          }
        />
        <Route
          path="/settings"
          element={
            <Layout>
              <Settings />
            </Layout>
          }
        />

        {/* Redirect unknown routes to homepage */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
