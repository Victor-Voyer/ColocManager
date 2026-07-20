import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router'
import GuestRoute from './components/GuestRoute/GuestRoute.jsx'
import ProtectedLayout from './components/ProtectedLayout/ProtectedLayout.jsx'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute.jsx'
import Homepage from './pages/Homepage/Homepage.jsx'
import Login from './pages/Auth/Login.jsx'
import Register from './pages/Auth/Register.jsx'
import Dashboard from './pages/Dashboard/Dashboard.jsx'
import Expenses from './pages/Expenses/Expenses.jsx'
import Tasks from './pages/Tasks/Tasks.jsx'
import Settings from './pages/Settings/Settings.jsx'
import HandleColocation from './pages/HandleColocation/HandleColocation.jsx'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />

        <Route
          path="/login"
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestRoute>
              <Register />
            </GuestRoute>
          }
        />

        <Route
          element={
            <ProtectedRoute>
              <ProtectedLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/collocations" element={<HandleColocation />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
