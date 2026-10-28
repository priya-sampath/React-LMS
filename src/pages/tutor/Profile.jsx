import React, { useEffect, useState } from 'react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as yup from 'yup'
import { useNavigate } from 'react-router-dom'
import { axiosInstance } from '../../utils/axiosInstance'
import { getAccessToken, setAuth, clearAuth } from '../../utils/authStore'

const profileSchema = yup.object({
  username: yup.string().trim().min(3, 'Username must be atleast 3 characters').required('Username is required'),
  bio: yup.string().max(500, 'Keep it under 500 characters'),
  qualifications: yup.string().max(300, 'Keep it under 300 characters'),
  experience: yup.number().typeError('Must be a number').min(0, 'Cannot be negative'),
})

const Profile = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [serverError, setServerError] = useState('')
  const [serverSuccess, setServerSuccess] = useState('')
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [deactivating, setDeactivating] = useState(false)
  const [expertiseInput, setExpertiseInput] = useState('')

  const fetchProfile = async () => {
    try {
      const token = getAccessToken()
      const res = await axiosInstance.get('/user/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUser(res.data.data)
    } catch (error) {
      setServerError(error.response?.data?.message || 'Could not load profile')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleAvatarUpload = async () => {
    if (!avatarFile) return
    setUploadingAvatar(true)
    setServerError('')
    setServerSuccess('')
    try {
      const token = getAccessToken()
      const formData = new FormData()
      formData.append('avatar', avatarFile)

      const res = await axiosInstance.patch('/user/me/avatar', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })
      setUser(res.data.data)
      setAuth({ user: res.data.data })
      setServerSuccess('Profile picture updated')
      setAvatarFile(null)
    } catch (error) {
      setServerError(error.response?.data?.message || 'Could not upload avatar')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleDeactivate = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to deactivate your account? You will be logged out and won\'t be able to log back in until an admin reactivates it. Your data will not be deleted.'
    )
    if (!confirmed) return

    setDeactivating(true)
    try {
      const token = getAccessToken()
      await axiosInstance.patch(
        '/user/deactivate',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
    } catch (error) {
      console.log('Deactivate error', error)
    } finally {
      clearAuth()
      navigate('/login')
    }
  }

  if (loading) {
    return <p className='text-gray-500'>Loading profile...</p>
  }

  return (
    <div>
      <h1 className='text-2xl font-bold mb-6'>Profile</h1>

      {serverError && (
        <p className='bg-red-100 text-red-700 text-sm p-2 rounded mb-4'>{serverError}</p>
      )}
      {serverSuccess && (
        <p className='bg-green-100 text-green-700 text-sm p-2 rounded mb-4'>{serverSuccess}</p>
      )}

      <div className='bg-white rounded-lg shadow-sm p-6 max-w-md mb-6'>
        <h2 className='text-lg font-semibold mb-4'>Profile Picture</h2>
        <div className='flex items-center gap-4'>
          {avatarPreview || user?.avatarUrl ? (
            <img
              src={avatarPreview || user.avatarUrl}
              alt='Avatar'
              className='w-16 h-16 rounded-full object-cover'
            />
          ) : (
            <div className='w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-xl'>
              {user?.username?.[0]?.toUpperCase() || 'T'}
            </div>
          )}
          <div className='flex flex-col gap-2'>
            <input type='file' accept='image/*' onChange={handleAvatarChange} className='text-sm' />
            <button
              onClick={handleAvatarUpload}
              disabled={!avatarFile || uploadingAvatar}
              className='bg-blue-600 text-white px-4 py-1.5 rounded hover:bg-blue-700 text-sm font-medium disabled:opacity-50 self-start'
            >
              {uploadingAvatar ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </div>
      </div>

      <div className='bg-white rounded-lg shadow-sm p-6 max-w-md mb-6'>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-lg font-semibold'>Profile Details</h2>
          {user?.totalReviews > 0 && (
            <span className='text-sm text-gray-500'>
              ★ {user.averageRating} ({user.totalReviews} review{user.totalReviews === 1 ? '' : 's'})
            </span>
          )}
        </div>
        <Formik
          enableReinitialize
          initialValues={{
            username: user?.username || '',
            email: user?.email || '',
            bio: user?.bio || '',
            qualifications: user?.qualifications || '',
            experience: user?.experience || 0,
            expertise: user?.expertise || [],
          }}
          validationSchema={profileSchema}
          onSubmit={async (values, { setSubmitting }) => {
            setServerError('')
            setServerSuccess('')
            try {
              const token = getAccessToken()
              const res = await axiosInstance.patch(
                '/user/me',
                {
                  username: values.username,
                  bio: values.bio,
                  qualifications: values.qualifications,
                  experience: values.experience,
                  expertise: values.expertise,
                },
                { headers: { Authorization: `Bearer ${token}` } }
              )
              setUser(res.data.data)
              setAuth({ user: res.data.data })
              setServerSuccess(res.data.message || 'Profile updated')
            } catch (error) {
              setServerError(error.response?.data?.message || 'Something went wrong')
            } finally {
              setSubmitting(false)
            }
          }}
        >
          {({ values, setFieldValue, isSubmitting }) => (
            <Form className='flex flex-col gap-4'>
              <div>
                <label htmlFor='username' className='block text-sm font-medium mb-1'>Username</label>
                <Field name='username' type='text' className='w-full border rounded px-3 py-2 outline-none focus:border-blue-500' />
                <ErrorMessage name='username' component='p' className='text-red-600 text-sm mt-1' />
              </div>

              <div>
                <label htmlFor='email' className='block text-sm font-medium mb-1'>Email</label>
                <Field name='email' type='email' disabled className='w-full border rounded px-3 py-2 bg-gray-100 text-gray-500' />
              </div>

              <div>
                <label htmlFor='bio' className='block text-sm font-medium mb-1'>Bio</label>
                <Field as='textarea' name='bio' rows={3} placeholder='Tell students about yourself...' className='w-full border rounded px-3 py-2 outline-none focus:border-blue-500' />
                <ErrorMessage name='bio' component='p' className='text-red-600 text-sm mt-1' />
              </div>

              <div>
                <label htmlFor='qualifications' className='block text-sm font-medium mb-1'>Qualifications</label>
                <Field name='qualifications' type='text' placeholder='e.g. M.Sc Computer Science' className='w-full border rounded px-3 py-2 outline-none focus:border-blue-500' />
                <ErrorMessage name='qualifications' component='p' className='text-red-600 text-sm mt-1' />
              </div>

              <div>
                <label htmlFor='experience' className='block text-sm font-medium mb-1'>Years of Experience</label>
                <Field name='experience' type='number' min='0' onWheel={(e) => e.target.blur()} className='w-full border rounded px-3 py-2 outline-none focus:border-blue-500' />
                <ErrorMessage name='experience' component='p' className='text-red-600 text-sm mt-1' />
              </div>

              <div>
                <label className='block text-sm font-medium mb-1'>Subjects / Expertise</label>
                <div className='flex flex-wrap gap-2 mb-2'>
                  {values.expertise.map((subject, idx) => (
                    <span key={idx} className='bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full flex items-center gap-1'>
                      {subject}
                      <button
                        type='button'
                        onClick={() => setFieldValue('expertise', values.expertise.filter((_, i) => i !== idx))}
                        className='text-blue-500 hover:text-blue-800'
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
                <div className='flex gap-2'>
                  <input
                    type='text'
                    value={expertiseInput}
                    onChange={(e) => setExpertiseInput(e.target.value)}
                    placeholder='e.g. React'
                    className='flex-1 border rounded px-3 py-2 text-sm outline-none focus:border-blue-500'
                  />
                  <button
                    type='button'
                    onClick={() => {
                      if (expertiseInput.trim()) {
                        setFieldValue('expertise', [...values.expertise, expertiseInput.trim()])
                        setExpertiseInput('')
                      }
                    }}
                    className='border px-3 py-2 rounded text-sm hover:bg-gray-50'
                  >
                    Add
                  </button>
                </div>
              </div>

              <button
                type='submit'
                disabled={isSubmitting}
                className='bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50'
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </Form>
          )}
        </Formik>
      </div>

      <div className='bg-white rounded-lg shadow-sm p-6 max-w-md border border-red-200'>
        <h2 className='text-lg font-semibold mb-2 text-red-700'>Danger Zone</h2>
        <p className='text-sm text-gray-500 mb-4'>
          Deactivating your account will log you out and block future logins until an admin reactivates it. Your courses and data stay intact.
        </p>
        <button
          onClick={handleDeactivate}
          disabled={deactivating}
          className='border border-red-600 text-red-600 px-4 py-2 rounded hover:bg-red-50 text-sm font-medium disabled:opacity-50'
        >
          {deactivating ? 'Deactivating...' : 'Deactivate My Account'}
        </button>
      </div>
    </div>
  )
}

export default Profile
