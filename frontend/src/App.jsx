import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './layout/AppLayout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import CrudPage from './pages/CrudPage.jsx'
import { pageConfigs } from './pages/pageConfigs.jsx'
import AuthPage from './pages/AuthPage.jsx'
import PortalLayout from './portal/PortalLayout.jsx'
import PortalHome from './portal/PortalHome.jsx'
import PortalCats from './portal/PortalCats.jsx'
import PortalCatDetail from './portal/PortalCatDetail.jsx'
import PortalPosts from './portal/PortalPosts.jsx'
import PortalPostNew from './portal/PortalPostNew.jsx'
import PortalPostDetail from './portal/PortalPostDetail.jsx'
import PortalSupplies from './portal/PortalSupplies.jsx'
import PortalDonations from './portal/PortalDonations.jsx'
import PortalMe from './portal/PortalMe.jsx'

function isLoggedIn() {
  return Boolean(localStorage.getItem('campus_cats_token'))
}

function ProtectedRoute({ children }) {
  return isLoggedIn() ? children : <Navigate to="/auth" replace />
}

function PublicOnlyRoute({ children }) {
  return isLoggedIn() ? <Navigate to="/" replace /> : children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/portal" element={<PortalLayout />}>
          <Route index element={<PortalHome />} />
          <Route path="cats" element={<PortalCats />} />
          <Route path="cats/:id" element={<PortalCatDetail />} />
          <Route path="posts" element={<PortalPosts />} />
          <Route path="posts/new" element={<PortalPostNew />} />
          <Route path="posts/:id" element={<PortalPostDetail />} />
          <Route path="supplies" element={<PortalSupplies />} />
          <Route path="donations" element={<PortalDonations />} />
          <Route path="me" element={<PortalMe />} />
        </Route>
        <Route path="/auth" element={<PublicOnlyRoute><AuthPage /></PublicOnlyRoute>} />
        <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          {pageConfigs.map((config) => (
            <Route key={config.path} path={config.path} element={<CrudPage config={config} />} />
          ))}
        </Route>
        <Route path="*" element={<Navigate to="/portal" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
