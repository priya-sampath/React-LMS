import React from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { axiosInstance } from '../../utils/axiosInstance'
import { getAccessToken, getUser, clearAuth } from '../../utils/authStore'

const navItems = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/tutors', label: 'Tutors' },
  { to: '/admin/students', label: 'Students' },
  { to: '/admin/courses', label: 'Courses' },
]

const AdminLayout = () => {
  const navigate = useNavigate()
  const user = getUser() || {}

  const handleLogout = async () => {
    try {
      const token = getAccessToken()
      await axiosInstance.post(
        '/user/logout',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
    } catch (error) {
      console.log('Logout error', error)
    } finally {
      clearAuth()
      navigate('/login')
    }
  }

  return (
    <div className='min-h-screen flex bg-gray-100'>
      <aside className='w-64 bg-white border-r flex flex-col'>
        <div className='flex items-center gap-2 px-6 py-5 border-b'>
          <div className='w-9 h-9 rounded-lg bg-gray-900 flex items-center justify-center text-white font-bold'>
            L
          </div>
          <span className='text-lg font-bold text-gray-800'>LMS Admin</span>
        </div>

        <nav className='flex-1 px-3 py-4 flex flex-col gap-1'>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `px-4 py-2 rounded-md text-sm font-medium ${
                  isActive
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className='px-3 py-4 border-t'>
          <p className='px-4 text-xs text-gray-400 mb-2'>Signed in as {user.username || 'Admin'}</p>
          <button
            onClick={handleLogout}
            className='w-full px-4 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 text-left'
          >
            Logout
          </button>
        </div>
      </aside>

      <main className='flex-1 p-8'>
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout
