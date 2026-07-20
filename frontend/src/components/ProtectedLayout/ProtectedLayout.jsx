import { Outlet } from 'react-router'
import Layout from '../Layout/Layout.jsx'

function ProtectedLayout() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  )
}

export default ProtectedLayout
