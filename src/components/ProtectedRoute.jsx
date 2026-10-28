import React from 'react'
import { Navigate } from 'react-router-dom'
import { getAccessToken, getUser } from '../utils/authStore'

const ProtectedRoute = ({ children, allowedRole }) => {
  const token = getAccessToken()
  if (!token) {
    return <Navigate to='/login' replace />
  }

  if (allowedRole) {
    const user = getUser() || {}
    if (user.role !== allowedRole) {
      return <Navigate to='/' replace />
    }
  }

  return children
}

export default ProtectedRoute
