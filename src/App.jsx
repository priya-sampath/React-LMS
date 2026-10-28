import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import VerifyEmail from './pages/VerifyEmail'
import ForgotPassword from './pages/ForgotPassword'
import VerifyOtp from './pages/VerifyOtp'
import ResetPassword from './pages/ResetPassword'
import ProtectedRoute from './components/ProtectedRoute'
import TutorLayout from './pages/tutor/TutorLayout'
import Overview from './pages/tutor/Overview'
import Courses from './pages/tutor/Courses'
import Students from './pages/tutor/Students'
import Payments from './pages/tutor/Payments'
import Profile from './pages/tutor/Profile'
import LiveClass from './pages/tutor/LiveClass'
import TutorReviews from './pages/tutor/Reviews'
import TutorRecordings from './pages/tutor/Recordings'
import StudentLayout from './pages/student/StudentLayout'
import StudentOverview from './pages/student/Overview'
import StudentMyCourses from './pages/student/MyCourses'
import StudentSearchCourses from './pages/student/SearchCourses'
import StudentPayments from './pages/student/Payments'
import StudentProfile from './pages/student/Profile'
import BrowseTutors from './pages/student/BrowseTutors'
import TutorProfilePublic from './pages/student/TutorProfile'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/Dashboard'
import AdminTutors from './pages/admin/Tutors'
import AdminStudents from './pages/admin/Students'
import AdminCourses from './pages/admin/Courses'

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    ),
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/signup',
    element: <Signup />,
  },
  {
    path: '/verify/:token',
    element: <VerifyEmail />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
  },
  {
    path: '/verify-otp',
    element: <VerifyOtp />,
  },
  {
    path: '/reset-password',
    element: <ResetPassword />,
  },
  {
    path: '/tutor',
    element: (
      <ProtectedRoute allowedRole='tutor'>
        <TutorLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Overview /> },
      { path: 'courses', element: <Courses /> },
      { path: 'live-class', element: <LiveClass /> },
      { path: 'students', element: <Students /> },
      { path: 'payments', element: <Payments /> },
      { path: 'profile', element: <Profile /> },
      { path: 'reviews', element: <TutorReviews /> },
      { path: 'recordings', element: <TutorRecordings /> },
    ],
  },
  {
    path: '/student',
    element: (
      <ProtectedRoute allowedRole='student'>
        <StudentLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <StudentOverview /> },
      { path: 'courses', element: <StudentMyCourses /> },
      { path: 'search', element: <StudentSearchCourses /> },
      { path: 'tutors', element: <BrowseTutors /> },
      { path: 'tutors/:id', element: <TutorProfilePublic /> },
      { path: 'payments', element: <StudentPayments /> },
      { path: 'profile', element: <StudentProfile /> },
    ],
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute allowedRole='admin'>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'tutors', element: <AdminTutors /> },
      { path: 'students', element: <AdminStudents /> },
      { path: 'courses', element: <AdminCourses /> },
    ],
  },
])

const App = () => {
  return <RouterProvider router={router} />
}

export default App