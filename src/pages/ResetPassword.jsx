import React, { useState } from 'react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import { useLocation, useNavigate, Navigate } from 'react-router-dom'
import { resetPasswordSchema } from '../validators/authValidate'
import { axiosInstance } from '../utils/axiosInstance'

const ResetPassword = () => {
  const [serverError, setServerError] = useState('')
  const location = useLocation()
  const navigate = useNavigate()
  const email = location.state?.email

  if (!email) {
    return <Navigate to='/forgot-password' replace />
  }

  return (
    <div className='flex justify-center items-center min-h-screen bg-gray-100'>
      <div className='w-full max-w-md bg-white p-8 rounded-lg shadow-md'>
        <h1 className='text-2xl font-bold text-center mb-6'>Reset Password</h1>

        {serverError && (
          <p className='bg-red-100 text-red-700 text-sm p-2 rounded mb-4'>{serverError}</p>
        )}

        <Formik
          initialValues={{ newPassword: '', confirmPassword: '' }}
          validationSchema={resetPasswordSchema}
          onSubmit={async (values, { setSubmitting }) => {
            setServerError('')
            try {
              await axiosInstance.post(`/user/change-password/${email}`, values)
              navigate('/login')
            } catch (error) {
              setServerError(error.response?.data?.message || 'Something went wrong')
            } finally {
              setSubmitting(false)
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form className='flex flex-col gap-4'>
              <div>
                <label htmlFor='newPassword' className='block text-sm font-medium mb-1'>New Password</label>
                <Field
                  name='newPassword'
                  type='password'
                  className='w-full border rounded px-3 py-2 outline-none focus:border-blue-500'
                />
                <ErrorMessage name='newPassword' component='p' className='text-red-600 text-sm mt-1' />
              </div>

              <div>
                <label htmlFor='confirmPassword' className='block text-sm font-medium mb-1'>Confirm Password</label>
                <Field
                  name='confirmPassword'
                  type='password'
                  className='w-full border rounded px-3 py-2 outline-none focus:border-blue-500'
                />
                <ErrorMessage name='confirmPassword' component='p' className='text-red-600 text-sm mt-1' />
              </div>

              <button
                type='submit'
                disabled={isSubmitting}
                className='bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50'
              >
                {isSubmitting ? 'Resetting...' : 'Reset Password'}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  )
}

export default ResetPassword
