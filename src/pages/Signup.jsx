import React, { useState } from 'react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import { Link, useNavigate } from 'react-router-dom'
import { signupSchema } from '../validators/authValidate'
import { axiosInstance } from '../utils/axiosInstance'

const Signup = () => {
  const [serverError, setServerError] = useState('')
  const [serverSuccess, setServerSuccess] = useState('')
  const navigate = useNavigate()

  return (
    <div className='flex justify-center items-center min-h-screen bg-gray-100'>
      <div className='w-full max-w-md bg-white p-8 rounded-lg shadow-md'>
        <h1 className='text-2xl font-bold text-center mb-6'>Create an Account</h1>

        {serverError && (
          <p className='bg-red-100 text-red-700 text-sm p-2 rounded mb-4'>{serverError}</p>
        )}
        {serverSuccess && (
          <p className='bg-green-100 text-green-700 text-sm p-2 rounded mb-4'>{serverSuccess}</p>
        )}

        <Formik
          initialValues={{
            username: '',
            email: '',
            password: '',
            role: 'student',
          }}
          validationSchema={signupSchema}
          onSubmit={async (values, { setSubmitting, resetForm }) => {
            setServerError('')
            setServerSuccess('')
            try {
              const res = await axiosInstance.post('/user/register', values)
              setServerSuccess(res.data.message)
              resetForm()
              setTimeout(() => {
                navigate('/login')
              }, 1500)
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
                <label htmlFor='username' className='block text-sm font-medium mb-1'>Username</label>
                <Field
                  name='username'
                  type='text'
                  className='w-full border rounded px-3 py-2 outline-none focus:border-blue-500'
                />
                <ErrorMessage name='username' component='p' className='text-red-600 text-sm mt-1' />
              </div>

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

              <div>
                <label className='block text-sm font-medium mb-2'>Role</label>
                <div className='flex gap-6'>
                  <label className='flex items-center gap-2 text-sm'>
                    <Field type='radio' name='role' value='student' className='accent-blue-600' />
                    Student
                  </label>
                  <label className='flex items-center gap-2 text-sm'>
                    <Field type='radio' name='role' value='tutor' className='accent-blue-600' />
                    Tutor
                  </label>
                </div>
                <ErrorMessage name='role' component='p' className='text-red-600 text-sm mt-1' />
              </div>

              <button
                type='submit'
                disabled={isSubmitting}
                className='bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50'
              >
                {isSubmitting ? 'Creating account...' : 'Sign Up'}
              </button>
            </Form>
          )}
        </Formik>

        <p className='text-sm text-center mt-4'>
          Already have an account?{' '}
          <Link to='/login' className='text-blue-600 hover:underline'>Login</Link>
        </p>
      </div>
    </div>
  )
}

export default Signup
