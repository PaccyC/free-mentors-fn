import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import MentorsList from './pages/mentors/MentorsList';
import MentorDetail from './pages/mentors/MentorDetail';
import Dashboard from './pages/dashboard/Dashboard';
import MentorDashboard from './pages/dashboard/MentorDashboard';
import AdminPanel from './pages/admin/AdminPanel';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/mentors" element={<MentorsList />} />
            <Route path="/mentors/:id" element={<MentorDetail />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute roles={['USER', 'MENTOR', 'ADMIN']}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mentor-dashboard"
              element={
                <ProtectedRoute roles={['MENTOR']}>
                  <MentorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute roles={['ADMIN']}>
                  <AdminPanel />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
