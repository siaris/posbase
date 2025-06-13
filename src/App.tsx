import { Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import MasterBarang from './pages/MasterBarang'; // Added import
import Error404 from './pages/Error404'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './contexts/AuthContext'

export default function App(): React.JSX.Element {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* Protected Routes */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/master-barang" element={<MasterBarang />} /> {/* Added route */}
        </Route>
        <Route path="*" element={<Error404 />} />
      </Routes>
    </AuthProvider>
  )
}
