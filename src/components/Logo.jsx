import React from 'react'
import { useNavigate } from 'react-router-dom'
import { getAccessToken } from '../utils/authStore'

const Logo = () => {
  const navigate = useNavigate()

  const handleClick = () => {
    const token = getAccessToken()
    navigate(token ? '/' : '/login')
  }

  return (
    <button
      onClick={handleClick}
      className='flex items-center gap-2 mx-auto mb-6'
    >
      <div className='w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg'>
        L
      </div>
      <span className='text-xl font-bold text-gray-800'>LMS</span>
    </button>
  )
}

export default Logo
