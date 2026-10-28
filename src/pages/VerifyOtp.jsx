import React, { useState } from 'react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import { useLocation, useNavigate, Navigate } from 'react-router-dom'
import { otpSchema } from '../validators/authValidate'
import { axiosInstance } from '../utils/axiosInstance'

const VerifyOtp = () => {
  const [serverError, setServerError] = useState('')
  const location = useLocation()
  const navigate = useNavigate()
  const email = location.state?.email

  // no email means the user landed here directly, send them back to start the flow properly
  if (!email) {
    return <Navigate to='/forgot-password' replace />
  }

  return (
    <div className='flex justify-center items-center min-h-screen bg-gray-100'>
      <div className='w-full max-w-md bg-white p-8 rounded-lg shadow-md'>
        <h1 className='text-2xl font-bold text-center mb-2'>Verify OTP</h1>
        <p className='text-sm text-gray-500 text-center mb-6'>
          Enter the 6-digit OTP sent to <span className='font-medium'>{email}</span>
        </p>

        {serverError && (
          <p className='bg-red-100 text-red-700 text-sm p-2 rounded mb-4'>{serverError}</p>
        )}

        <Formik
          initialValues={{ otp: '' }}
          validationSchema={otpSchema}
          onSubmit={async (values, { setSubmitting }) => {
            setServerError('')
            try {
              await axiosInstance.post(`/user/verify-otp/${email}`, values)
              navigate('/reset-password', { state: { email } })
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
                <label htmlFor='otp' className='block text-sm font-medium mb-1'>OTP</label>
                <Field
                  name='otp'
                  type='text'
                  maxLength={6}
                  className='w-full border rounded px-3 py-2 outline-none focus:border-blue-500 tracking-widest text-center'
                />
                <ErrorMessage name='otp' component='p' className='text-red-600 text-sm mt-1' />
              </div>

              <button
                type='submit'
                disabled={isSubmitting}
                className='bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50'
              >
                {isSubmitting ? 'Verifying...' : 'Verify OTP'}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  )
}

export default VerifyOtp
