import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { axiosInstance } from '../utils/axiosInstance'

const VerifyEmail = () => {
  const { token } = useParams()
  const [status, setStatus] = useState('verifying') // verifying | success | error
  const [message, setMessage] = useState('')

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus('error')
        setMessage('Verification token is missing')
        return
      }
      try {
        const res = await axiosInstance.post(
          '/user/verify',
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        )
        setStatus('success')
        setMessage(res.data.message)
      } catch (error) {
        setStatus('error')
        setMessage(error.response?.data?.message || 'Verification failed')
      }
    }
    verify()
  }, [token])

  return (
    <div className='flex justify-center items-center min-h-screen bg-gray-100'>
      <div className='w-full max-w-md bg-white p-8 rounded-lg shadow-md text-center'>
        {status === 'verifying' && <p>Verifying your email...</p>}

        {status === 'success' && (
          <>
            <p className='bg-green-100 text-green-700 text-sm p-2 rounded mb-4'>{message}</p>
            <Link to='/login' className='text-blue-600 hover:underline'>Go to Login</Link>
          </>
        )}

        {status === 'error' && (
          <>
            <p className='bg-red-100 text-red-700 text-sm p-2 rounded mb-4'>{message}</p>
            <Link to='/signup' className='text-blue-600 hover:underline'>Back to Sign Up</Link>
          </>
        )}
      </div>
    </div>
  )
}

export default VerifyEmail
