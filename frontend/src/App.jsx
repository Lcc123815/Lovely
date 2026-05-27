import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './layout/AppLayout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import CrudPage from './pages/CrudPage.jsx'
import { pageConfigs } from './pages/pageConfigs.jsx'
import AuthPage from './pages/AuthPage.jsx'

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
        <Route path="/auth" element={<PublicOnlyRoute><AuthPage /></PublicOnlyRoute>} />
        <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          {pageConfigs.map((config) => (
            <Route key={config.path} path={config.path} element={<CrudPage config={config} />} />
          ))}
        </Route>
        <Route path="*" element={<Navigate to={isLoggedIn() ? '/' : '/auth'} replace />} />
      </Routes>
    </BrowserRouter>
  )
}
