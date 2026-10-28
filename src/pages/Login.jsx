import React, { useState } from 'react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import { Link, useNavigate } from 'react-router-dom'
import { loginSchema } from '../validators/authValidate'
import { axiosInstance } from '../utils/axiosInstance'
import { setAuth } from '../utils/authStore'
import Logo from '../components/Logo'

const Login = () => {
  const [serverError, setServerError] = useState('')
  const navigate = useNavigate()

  return (
    <div className='flex justify-center items-center min-h-screen bg-gray-100'>
      <div className='w-full max-w-md bg-white p-8 rounded-lg shadow-md'>
        <Logo />
        <h1 className='text-2xl font-bold text-center mb-6'>Login</h1>

        {serverError && (
          <p className='bg-red-100 text-red-700 text-sm p-2 rounded mb-4'>{serverError}</p>
        )}

        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={loginSchema}
          onSubmit={async (values, { setSubmitting }) => {
            setServerError('')
            try {
              const res = await axiosInstance.post('/user/login', values)
              setAuth({
                accessToken: res.data.accessToken,
                refreshToken: res.data.refreshToken,
                user: res.data.user
              })
              const role = res.data.user.role
              const roleRoutes = { tutor: '/tutor', student: '/student', admin: '/admin' }
              navigate(roleRoutes[role] || '/')
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

              <div>
                <label htmlFor='password' className='block text-sm font-medium mb-1'>Password</label>
                <Field
                  name='password'
                  type='password'
                  className='w-full border rounded px-3 py-2 outline-none focus:border-blue-500'
                />
                <ErrorMessage name='password' component='p' className='text-red-600 text-sm mt-1' />
              </div>

              <div className='text-right'>
                <Link to='/forgot-password' className='text-sm text-blue-600 hover:underline'>
                  Forgot Password?
                </Link>
              </div>

              <button
                type='submit'
                disabled={isSubmitting}
                className='bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50'
              >
                {isSubmitting ? 'Logging in...' : 'Login'}
              </button>
            </Form>
          )}
        </Formik>

        <p className='text-sm text-center mt-4'>
          Don't have an account?{' '}
          <Link to='/signup' className='text-blue-600 hover:underline'>Sign Up</Link>
        </p>
      </div>
    </div>
  )
}

export default Login
