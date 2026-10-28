import React from 'react'
import { useNavigate } from 'react-router-dom'
import { axiosInstance } from '../utils/axiosInstance'
import { getAccessToken, clearAuth } from '../utils/authStore'

const Home = () => {
  const navigate = useNavigate()

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
    <div className='min-h-screen bg-gray-100'>
      <nav className='flex justify-between items-center bg-white px-6 py-4 shadow-sm'>
        <h1 className='text-xl font-bold'>LMS</h1>
        <button
          onClick={handleLogout}
          className='bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700'
        >
          Logout
        </button>
      </nav>

      <div className='flex flex-col items-center justify-center mt-20'>
        <h2 className='text-2xl font-semibold'>Welcome to your dashboard</h2>
        <p className='text-gray-500 mt-2'>You're logged in.</p>
      </div>
    </div>
  )
}

export default Home
