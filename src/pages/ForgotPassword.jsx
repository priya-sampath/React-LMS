import React, { useState } from 'react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import { Link, useNavigate } from 'react-router-dom'
import { forgotPasswordSchema } from '../validators/authValidate'
import { axiosInstance } from '../utils/axiosInstance'

const ForgotPassword = () => {
  const [serverError, setServerError] = useState('')
  const navigate = useNavigate()

  return (
    <div className='flex justify-center items-center min-h-screen bg-gray-100'>
      <div className='w-full max-w-md bg-white p-8 rounded-lg shadow-md'>
        <h1 className='text-2xl font-bold text-center mb-2'>Forgot Password</h1>
        <p className='text-sm text-gray-500 text-center mb-6'>
          Enter your email and we'll send you an OTP to reset your password.
        </p>

        {serverError && (
          <p className='bg-red-100 text-red-700 text-sm p-2 rounded mb-4'>{serverError}</p>
        )}

        <Formik
          initialValues={{ email: '' }}
          validationSchema={forgotPasswordSchema}
          onSubmit={async (values, { setSubmitting }) => {
            setServerError('')
            try {
              await axiosInstance.post('/user/forgot-password', values)
              navigate('/verify-otp', { state: { email: values.email } })
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
                <label htmlFor='email' className='block text-sm font-medium mb-1'>Email</label>
                <Field
                  name='email'
                  type='email'
                  className='w-full border rounded px-3 py-2 outline-none focus:border-blue-500'
                />
                <ErrorMessage name='email' component='p' className='text-red-600 text-sm mt-1' />
              </div>

              <button
                type='submit'
                disabled={isSubmitting}
                className='bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50'
              >
                {isSubmitting ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </Form>
          )}
        </Formik>

        <p className='text-sm text-center mt-4'>
          Remembered your password?{' '}
          <Link to='/login' className='text-blue-600 hover:underline'>Login</Link>
        </p>
      </div>
    </div>
  )
}

export default ForgotPassword
