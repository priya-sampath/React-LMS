import React, { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { axiosInstance } from '../../utils/axiosInstance'
import { getAccessToken, getUser, clearAuth } from '../../utils/authStore'

const navItems = [
  { to: '/student', label: 'Dashboard', end: true },
  { to: '/student/courses', label: 'My Courses' },
  { to: '/student/search', label: 'Search Courses' },
  { to: '/student/tutors', label: 'Browse Tutors' },
  { to: '/student/payments', label: 'Payments' },
]

const StudentLayout = () => {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  const user = getUser() || {}
  const initial = user.username ? user.username[0].toUpperCase() : 'S'

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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
          <div className='w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold'>
            L
          </div>
          <span className='text-lg font-bold text-gray-800'>LMS Student</span>
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
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className='flex-1 flex flex-col'>
        <header className='flex justify-end items-center bg-white border-b px-8 py-3'>
          <div className='relative' ref={menuRef}>
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className='flex items-center gap-2'
            >
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt='Profile'
                  className='w-9 h-9 rounded-full object-cover'
                />
              ) : (
                <div className='w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm'>
                  {initial}
                </div>
              )}
              <svg
                className={`w-4 h-4 text-gray-500 transition-transform ${menuOpen ? 'rotate-180' : ''}`}
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
              </svg>
            </button>

            {menuOpen && (
              <div className='absolute right-0 mt-2 w-44 bg-white border rounded-md shadow-md py-1 z-10'>
                <NavLink
                  to='/student/profile'
                  onClick={() => setMenuOpen(false)}
                  className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50'
                >
                  My Profile
                </NavLink>
                <button
                  onClick={handleLogout}
                  className='w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50'
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        <main className='flex-1 p-8'>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default StudentLayout
