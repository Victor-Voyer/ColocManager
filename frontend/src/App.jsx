import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router'
import Homepage from './pages/Homepage.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Expenses from './pages/Expenses.jsx'
import Tasks from './pages/Tasks.jsx'
import ShoppingList from './pages/ShoppingList.jsx'
import Messages from './pages/Messages.jsx'
import Settings from './pages/Settings.jsx'
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
          path="/messages"
          element={
            <Layout>
              <Messages />
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
