import React, { useEffect, useState } from 'react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as yup from 'yup'
import { axiosInstance } from '../../utils/axiosInstance'
import { getAccessToken } from '../../utils/authStore'

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const courseSchema = yup.object({
  title: yup.string().trim().min(3, 'Title must be atleast 3 characters').required('Title is required'),
  description: yup.string().trim().min(10, 'Description must be atleast 10 characters').required('Description is required'),
  notesFile: yup.mixed().required('Notes document is required'),

  liveClassAvailable: yup.string().oneOf(['true', 'false'], 'Please choose an option').required('Please choose an option'),
  liveFee: yup.number().typeError('Fee must be a number').min(0, 'Fee cannot be negative').when('liveClassAvailable', {
    is: 'true',
    then: (schema) => schema.required('Live class fee is required'),
  }),
  liveStartDate: yup.string().when('liveClassAvailable', {
    is: 'true',
    then: (schema) => schema.required('Start date is required'),
  }),
  liveEndDate: yup.string().when('liveClassAvailable', {
    is: 'true',
    then: (schema) => schema.required('End date is required'),
  }),
  availableDays: yup.array().when('liveClassAvailable', {
    is: 'true',
    then: (schema) => schema.min(1, 'Pick at least one day').required('Pick at least one day'),
  }),
  liveStartTime: yup.string().when('liveClassAvailable', {
    is: 'true',
    then: (schema) => schema.required('Start time is required'),
  }),
  liveEndTime: yup.string().when('liveClassAvailable', {
    is: 'true',
    then: (schema) => schema.required('End time is required'),
  }),
  maxReschedules: yup.number().typeError('Must be a number').min(0, 'Cannot be negative').when('liveClassAvailable', {
    is: 'true',
    then: (schema) => schema.required('Required — enter 0 if none allowed'),
  }),
  rescheduleWindowStart: yup.string().when('liveClassAvailable', {
    is: 'true',
    then: (schema) => schema.required('Required'),
  }),
  rescheduleWindowEnd: yup.string().when('liveClassAvailable', {
    is: 'true',
    then: (schema) => schema.required('Required'),
  }),

  recordedVideoAvailable: yup.string().oneOf(['true', 'false'], 'Please choose an option').required('Please choose an option'),
  recordedFee: yup.number().typeError('Fee must be a number').min(0, 'Fee cannot be negative').when('recordedVideoAvailable', {
    is: 'true',
    then: (schema) => schema.required('Recorded video fee is required'),
  }),
  videoFile: yup.mixed().when('recordedVideoAvailable', {
    is: 'true',
    then: (schema) => schema.required('A recorded video is required'),
  }),
})

const editSchema = yup.object({
  title: yup.string().trim().min(3, 'Title must be atleast 3 characters').required('Title is required'),
  description: yup.string().trim().min(10, 'Description must be atleast 10 characters').required('Description is required'),
  liveFee: yup.number().typeError('Fee must be a number').min(0, 'Fee cannot be negative'),
  liveStartDate: yup.string(),
  liveEndDate: yup.string(),
  availableDays: yup.array(),
  liveStartTime: yup.string(),
  liveEndTime: yup.string(),
  maxReschedules: yup.number().typeError('Must be a number').min(0, 'Cannot be negative'),
  rescheduleWindowStart: yup.string(),
  rescheduleWindowEnd: yup.string(),
  recordedFee: yup.number().typeError('Fee must be a number').min(0, 'Fee cannot be negative'),
})

const Courses = () => {
  const [showModal, setShowModal] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actioningId, setActioningId] = useState(null)

  const fetchCourses = async () => {
    setLoading(true)
    try {
      const token = getAccessToken()
      const res = await axiosInstance.get('/courses/my-courses', {
        headers: { Authorization: `Bearer ${token}` }
      })
      // deleted courses stay in the database (paid students keep access)
      // but shouldn't clutter the tutor's own list anymore
      setCourses(res.data.data.filter((c) => c.status !== 'deleted'))
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load courses')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  const handleToggleStatus = async (course) => {
    setActioningId(course._id)
    setError('')
    try {
      const token = getAccessToken()
      const res = await axiosInstance.patch(
        `/courses/${course._id}/toggle-status`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setCourses((prev) =>
        prev.map((c) => (c._id === course._id ? { ...c, status: res.data.data.status } : c))
      )
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update course status')
    } finally {
      setActioningId(null)
    }
  }

  const handleDelete = async (course) => {
    const confirmed = window.confirm(
      `Delete "${course.title}"? Students who already paid keep access, but new students won't be able to find or enroll in it anymore.`
    )
    if (!confirmed) return

    setActioningId(course._id)
    setError('')
    try {
      const token = getAccessToken()
      await axiosInstance.delete(`/courses/${course._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setCourses((prev) => prev.filter((c) => c._id !== course._id))
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete course')
    } finally {
      setActioningId(null)
    }
  }

  return (
    <div>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold'>My Courses</h1>
        <button
          onClick={() => setShowModal(true)}
          className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm font-medium'
        >
          + New Course
        </button>
      </div>

      {error && (
        <p className='bg-red-100 text-red-700 text-sm p-2 rounded mb-4'>{error}</p>
      )}

      {loading ? (
        <p className='text-gray-500'>Loading courses...</p>
      ) : (
        <div className='bg-white rounded-lg shadow-sm overflow-hidden'>
          <table className='w-full text-sm'>
            <thead className='bg-gray-50 text-left text-gray-500'>
              <tr>
                <th className='px-4 py-3'>Title</th>
                <th className='px-4 py-3'>Students</th>
                <th className='px-4 py-3'>Live</th>
                <th className='px-4 py-3'>Recorded</th>
                <th className='px-4 py-3'>Status</th>
                <th className='px-4 py-3'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course._id} className='border-t'>
                  <td className='px-4 py-3 font-medium'>{course.title}</td>
                  <td className='px-4 py-3'>{course.students}</td>
                  <td className='px-4 py-3'>{course.liveClassAvailable ? `₹${course.liveFee}` : '—'}</td>
                  <td className='px-4 py-3'>{course.recordedVideoAvailable ? `₹${course.recordedFee}` : '—'}</td>
                  <td className='px-4 py-3'>
                    <button
                      onClick={() => handleToggleStatus(course)}
                      disabled={actioningId === course._id}
                      className={`text-xs px-3 py-1 rounded-full font-medium disabled:opacity-50 ${
                        course.status === 'active'
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                      }`}
                    >
                      {course.status === 'active' ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className='px-4 py-3'>
                    <div className='flex gap-2'>
                      <button
                        onClick={() => setEditingCourse(course)}
                        className='border px-3 py-1 rounded text-xs font-medium hover:bg-gray-50'
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(course)}
                        disabled={actioningId === course._id}
                        className='border border-red-600 text-red-600 px-3 py-1 rounded text-xs font-medium hover:bg-red-50 disabled:opacity-50'
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-lg shadow-md w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto'>
            <h2 className='text-xl font-bold mb-4'>New Course</h2>

            <Formik
              initialValues={{
                title: '',
                description: '',
                notesFile: null,
                liveClassAvailable: '',
                liveFee: '',
                liveStartDate: '',
                liveEndDate: '',
                availableDays: [],
                liveStartTime: '',
                liveEndTime: '',
                maxReschedules: '',
                rescheduleWindowStart: '',
                rescheduleWindowEnd: '',
                recordedVideoAvailable: '',
                recordedFee: '',
                videoFile: null,
              }}
              validationSchema={courseSchema}
              onSubmit={async (values, { setSubmitting, setStatus, resetForm }) => {
                setStatus(null)
                try {
                  const token = getAccessToken()
                  const formData = new FormData()
                  formData.append('title', values.title)
                  formData.append('description', values.description)
                  formData.append('notes', values.notesFile)
                  formData.append('liveClassAvailable', values.liveClassAvailable)
                  formData.append('recordedVideoAvailable', values.recordedVideoAvailable)

                  if (values.liveClassAvailable === 'true') {
                    formData.append('liveFee', values.liveFee)
                    formData.append('startDate', values.liveStartDate)
                    formData.append('endDate', values.liveEndDate)
                    formData.append('availableDays', JSON.stringify(values.availableDays))
                    formData.append('startTime', values.liveStartTime)
                    formData.append('endTime', values.liveEndTime)
                    formData.append('maxReschedules', values.maxReschedules)
                    formData.append('rescheduleWindowStart', values.rescheduleWindowStart)
                    formData.append('rescheduleWindowEnd', values.rescheduleWindowEnd)
                  }

                  if (values.recordedVideoAvailable === 'true') {
                    formData.append('recordedFee', values.recordedFee)
                    formData.append('video', values.videoFile)
                  }

                  const res = await axiosInstance.post('/courses', formData, {
                    headers: {
                      Authorization: `Bearer ${token}`,
                      'Content-Type': 'multipart/form-data'
                    }
                  })

                  resetForm()
                  setShowModal(false)
                  // the backend still returns success:true if the course saved but
                  // the live video room setup failed — surface that instead of hiding it
                  if (res.data.message && res.data.message.toLowerCase().includes('could not be set up')) {
                    setError(res.data.message)
                  }
                  fetchCourses()
                } catch (error) {
                  setStatus(error.response?.data?.message || 'Could not create course')
                } finally {
                  setSubmitting(false)
                }
              }}
            >
              {({ values, setFieldValue, isSubmitting, status }) => (
                <Form className='flex flex-col gap-4'>
                  {status && (
                    <p className='bg-red-100 text-red-700 text-sm p-2 rounded'>{status}</p>
                  )}

                  <div>
                    <label htmlFor='title' className='block text-sm font-medium mb-1'>Title</label>
                    <Field name='title' type='text' className='w-full border rounded px-3 py-2 outline-none focus:border-blue-500' />
                    <ErrorMessage name='title' component='p' className='text-red-600 text-sm mt-1' />
                  </div>

                  <div>
                    <label htmlFor='description' className='block text-sm font-medium mb-1'>Description</label>
                    <Field as='textarea' name='description' rows={3} className='w-full border rounded px-3 py-2 outline-none focus:border-blue-500' />
                    <ErrorMessage name='description' component='p' className='text-red-600 text-sm mt-1' />
                  </div>

                  <div>
                    <label htmlFor='notesFile' className='block text-sm font-medium mb-1'>Notes Document (PDF/Word) *</label>
                    <input
                      id='notesFile'
                      name='notesFile'
                      type='file'
                      accept='.pdf,.doc,.docx'
                      onChange={(e) => setFieldValue('notesFile', e.target.files[0])}
                      className='w-full text-sm border rounded px-3 py-2'
                    />
                    <ErrorMessage name='notesFile' component='p' className='text-red-600 text-sm mt-1' />
                  </div>

                  {/* Live class section */}
                  <div className='border-t pt-4'>
                    <label className='block text-sm font-medium mb-2'>Are live classes available? *</label>
                    <div className='flex gap-6'>
                      <label className='flex items-center gap-2 text-sm'>
                        <Field type='radio' name='liveClassAvailable' value='true' className='accent-blue-600' />
                        Yes
                      </label>
                      <label className='flex items-center gap-2 text-sm'>
                        <Field type='radio' name='liveClassAvailable' value='false' className='accent-blue-600' />
                        No
                      </label>
                    </div>
                    <ErrorMessage name='liveClassAvailable' component='p' className='text-red-600 text-sm mt-1' />
                  </div>

                  {values.liveClassAvailable === 'true' && (
                    <div className='flex flex-col gap-4 bg-blue-50 rounded-md p-4'>
                      <div>
                        <label htmlFor='liveFee' className='block text-sm font-medium mb-1'>Live Class Fee (₹) *</label>
                        <Field name='liveFee' type='number' onWheel={(e) => e.target.blur()} className='w-full border rounded px-3 py-2 outline-none focus:border-blue-500' />
                        <ErrorMessage name='liveFee' component='p' className='text-red-600 text-sm mt-1' />
                      </div>

                      <div className='grid grid-cols-2 gap-3'>
                        <div>
                          <label htmlFor='liveStartDate' className='block text-sm font-medium mb-1'>Start Date *</label>
                          <Field name='liveStartDate' type='date' className='w-full border rounded px-3 py-2 outline-none focus:border-blue-500' />
                          <ErrorMessage name='liveStartDate' component='p' className='text-red-600 text-sm mt-1' />
                        </div>
                        <div>
                          <label htmlFor='liveEndDate' className='block text-sm font-medium mb-1'>End Date *</label>
                          <Field name='liveEndDate' type='date' className='w-full border rounded px-3 py-2 outline-none focus:border-blue-500' />
                          <ErrorMessage name='liveEndDate' component='p' className='text-red-600 text-sm mt-1' />
                        </div>
                      </div>

                      <div>
                        <label className='block text-sm font-medium mb-2'>Weekly Availability *</label>
                        <div className='flex flex-wrap gap-3'>
                          {WEEKDAYS.map((day) => (
                            <label key={day} className='flex items-center gap-1.5 text-sm bg-white border rounded px-2 py-1'>
                              <input
                                type='checkbox'
                                checked={values.availableDays.includes(day)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setFieldValue('availableDays', [...values.availableDays, day])
                                  } else {
                                    setFieldValue('availableDays', values.availableDays.filter((d) => d !== day))
                                  }
                                }}
                                className='accent-blue-600'
                              />
                              {day}
                            </label>
                          ))}
                        </div>
                        <ErrorMessage name='availableDays' component='p' className='text-red-600 text-sm mt-1' />
                      </div>

                      <div className='grid grid-cols-2 gap-3'>
                        <div>
                          <label htmlFor='liveStartTime' className='block text-sm font-medium mb-1'>Start Time *</label>
                          <Field name='liveStartTime' type='time' className='w-full border rounded px-3 py-2 outline-none focus:border-blue-500' />
                          <ErrorMessage name='liveStartTime' component='p' className='text-red-600 text-sm mt-1' />
                        </div>
                        <div>
                          <label htmlFor='liveEndTime' className='block text-sm font-medium mb-1'>End Time *</label>
                          <Field name='liveEndTime' type='time' className='w-full border rounded px-3 py-2 outline-none focus:border-blue-500' />
                          <ErrorMessage name='liveEndTime' component='p' className='text-red-600 text-sm mt-1' />
                        </div>
                      </div>

                      <div className='border-t pt-4'>
                        <p className='text-sm font-medium mb-2'>Reschedule Settings</p>
                        <div>
                          <label htmlFor='maxReschedules' className='block text-sm font-medium mb-1'>
                            How many times can a student reschedule? *
                          </label>
                          <Field name='maxReschedules' type='number' min='0' onWheel={(e) => e.target.blur()} className='w-full border rounded px-3 py-2 outline-none focus:border-blue-500' />
                          <ErrorMessage name='maxReschedules' component='p' className='text-red-600 text-sm mt-1' />
                        </div>

                        <div className='grid grid-cols-2 gap-3 mt-3'>
                          <div>
                            <label htmlFor='rescheduleWindowStart' className='block text-sm font-medium mb-1'>Makeup Slots Start *</label>
                            <Field name='rescheduleWindowStart' type='time' className='w-full border rounded px-3 py-2 outline-none focus:border-blue-500' />
                            <ErrorMessage name='rescheduleWindowStart' component='p' className='text-red-600 text-sm mt-1' />
                          </div>
                          <div>
                            <label htmlFor='rescheduleWindowEnd' className='block text-sm font-medium mb-1'>Makeup Slots End *</label>
                            <Field name='rescheduleWindowEnd' type='time' className='w-full border rounded px-3 py-2 outline-none focus:border-blue-500' />
                            <ErrorMessage name='rescheduleWindowEnd' component='p' className='text-red-600 text-sm mt-1' />
                          </div>
                        </div>
                        <p className='text-xs text-gray-500 mt-2'>
                          This window is split into slots the same length as your class (e.g. 9am–6pm with a 1-hour class = 9 makeup slots per day).
                        </p>
                      </div>

                      <p className='text-xs text-gray-500'>
                        A live video room is created automatically for this course — no meeting link needed.
                      </p>
                    </div>
                  )}

                  {/* Recorded video section */}
                  <div className='border-t pt-4'>
                    <label className='block text-sm font-medium mb-2'>Are recorded videos available? *</label>
                    <div className='flex gap-6'>
                      <label className='flex items-center gap-2 text-sm'>
                        <Field type='radio' name='recordedVideoAvailable' value='true' className='accent-blue-600' />
                        Yes
                      </label>
                      <label className='flex items-center gap-2 text-sm'>
                        <Field type='radio' name='recordedVideoAvailable' value='false' className='accent-blue-600' />
                        No
                      </label>
                    </div>
                    <ErrorMessage name='recordedVideoAvailable' component='p' className='text-red-600 text-sm mt-1' />
                  </div>

                  {values.recordedVideoAvailable === 'true' && (
                    <div className='flex flex-col gap-4 bg-blue-50 rounded-md p-4'>
                      <div>
                        <label htmlFor='recordedFee' className='block text-sm font-medium mb-1'>Recorded Video Fee (₹) *</label>
                        <Field name='recordedFee' type='number' onWheel={(e) => e.target.blur()} className='w-full border rounded px-3 py-2 outline-none focus:border-blue-500' />
                        <ErrorMessage name='recordedFee' component='p' className='text-red-600 text-sm mt-1' />
                      </div>

                      <div>
                        <label htmlFor='videoFile' className='block text-sm font-medium mb-1'>Upload Video *</label>
                        <input
                          id='videoFile'
                          name='videoFile'
                          type='file'
                          accept='video/*'
                          onChange={(e) => setFieldValue('videoFile', e.target.files[0])}
                          className='w-full text-sm border rounded px-3 py-2'
                        />
                        <ErrorMessage name='videoFile' component='p' className='text-red-600 text-sm mt-1' />
                      </div>
                    </div>
                  )}

                  <div className='flex gap-3 mt-2'>
                    <button
                      type='button'
                      onClick={() => setShowModal(false)}
                      className='flex-1 border py-2 rounded text-sm font-medium hover:bg-gray-50'
                    >
                      Cancel
                    </button>
                    <button
                      type='submit'
                      disabled={isSubmitting}
                      className='flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 text-sm font-medium disabled:opacity-50'
                    >
                      {isSubmitting ? 'Creating...' : 'Create Course'}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      )}

      {editingCourse && (
        <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-lg shadow-md w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto'>
            <h2 className='text-xl font-bold mb-4'>Edit Course</h2>

            <Formik
              initialValues={{
                title: editingCourse.title || '',
                description: editingCourse.description || '',
                liveFee: editingCourse.liveFee || '',
                liveStartDate: editingCourse.liveSchedule?.startDate ? editingCourse.liveSchedule.startDate.slice(0, 10) : '',
                liveEndDate: editingCourse.liveSchedule?.endDate ? editingCourse.liveSchedule.endDate.slice(0, 10) : '',
                availableDays: editingCourse.liveSchedule?.availableDays || [],
                liveStartTime: editingCourse.liveSchedule?.startTime || '',
                liveEndTime: editingCourse.liveSchedule?.endTime || '',
                maxReschedules: editingCourse.liveSchedule?.maxReschedules ?? '',
                rescheduleWindowStart: editingCourse.liveSchedule?.rescheduleWindowStart || '',
                rescheduleWindowEnd: editingCourse.liveSchedule?.rescheduleWindowEnd || '',
                recordedFee: editingCourse.recordedFee || '',
              }}
              validationSchema={editSchema}
              onSubmit={async (values, { setSubmitting, setStatus }) => {
                setStatus(null)
                try {
                  const token = getAccessToken()
                  const payload = {
                    title: values.title,
                    description: values.description,
                  }

                  if (editingCourse.liveClassAvailable) {
                    payload.liveFee = values.liveFee
                    payload.startDate = values.liveStartDate
                    payload.endDate = values.liveEndDate
                    payload.availableDays = JSON.stringify(values.availableDays)
                    payload.startTime = values.liveStartTime
                    payload.endTime = values.liveEndTime
                    payload.maxReschedules = values.maxReschedules
                    payload.rescheduleWindowStart = values.rescheduleWindowStart
                    payload.rescheduleWindowEnd = values.rescheduleWindowEnd
                  }
                  if (editingCourse.recordedVideoAvailable) {
                    payload.recordedFee = values.recordedFee
                  }

                  await axiosInstance.patch(`/courses/${editingCourse._id}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                  })

                  setEditingCourse(null)
                  fetchCourses()
                } catch (error) {
                  setStatus(error.response?.data?.message || 'Could not update course')
                } finally {
                  setSubmitting(false)
                }
              }}
            >
              {({ values, setFieldValue, isSubmitting, status }) => (
                <Form className='flex flex-col gap-4'>
                  {status && (
                    <p className='bg-red-100 text-red-700 text-sm p-2 rounded'>{status}</p>
                  )}

                  <div>
                    <label htmlFor='title' className='block text-sm font-medium mb-1'>Title</label>
                    <Field name='title' type='text' className='w-full border rounded px-3 py-2 outline-none focus:border-blue-500' />
                    <ErrorMessage name='title' component='p' className='text-red-600 text-sm mt-1' />
                  </div>

                  <div>
                    <label htmlFor='description' className='block text-sm font-medium mb-1'>Description</label>
                    <Field as='textarea' name='description' rows={3} className='w-full border rounded px-3 py-2 outline-none focus:border-blue-500' />
                    <ErrorMessage name='description' component='p' className='text-red-600 text-sm mt-1' />
                  </div>

                  <p className='text-xs text-gray-500 -mt-2'>
                    Notes document and recorded video can't be changed here — delete and recreate the course if you need to replace those files.
                  </p>

                  {editingCourse.liveClassAvailable && (
                    <div className='flex flex-col gap-4 bg-blue-50 rounded-md p-4'>
                      <p className='text-sm font-medium'>Live Class Settings</p>
                      <div>
                        <label htmlFor='liveFee' className='block text-sm font-medium mb-1'>Live Class Fee (₹)</label>
                        <Field name='liveFee' type='number' onWheel={(e) => e.target.blur()} className='w-full border rounded px-3 py-2 outline-none focus:border-blue-500' />
                        <ErrorMessage name='liveFee' component='p' className='text-red-600 text-sm mt-1' />
                      </div>

                      <div className='grid grid-cols-2 gap-3'>
                        <div>
                          <label htmlFor='liveStartDate' className='block text-sm font-medium mb-1'>Start Date</label>
                          <Field name='liveStartDate' type='date' className='w-full border rounded px-3 py-2 outline-none focus:border-blue-500' />
                        </div>
                        <div>
                          <label htmlFor='liveEndDate' className='block text-sm font-medium mb-1'>End Date</label>
                          <Field name='liveEndDate' type='date' className='w-full border rounded px-3 py-2 outline-none focus:border-blue-500' />
                        </div>
                      </div>

                      <div>
                        <label className='block text-sm font-medium mb-2'>Weekly Availability</label>
                        <div className='flex flex-wrap gap-3'>
                          {WEEKDAYS.map((day) => (
                            <label key={day} className='flex items-center gap-1.5 text-sm bg-white border rounded px-2 py-1'>
                              <input
                                type='checkbox'
                                checked={values.availableDays.includes(day)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setFieldValue('availableDays', [...values.availableDays, day])
                                  } else {
                                    setFieldValue('availableDays', values.availableDays.filter((d) => d !== day))
                                  }
                                }}
                                className='accent-blue-600'
                              />
                              {day}
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className='grid grid-cols-2 gap-3'>
                        <div>
                          <label htmlFor='liveStartTime' className='block text-sm font-medium mb-1'>Start Time</label>
                          <Field name='liveStartTime' type='time' className='w-full border rounded px-3 py-2 outline-none focus:border-blue-500' />
                        </div>
                        <div>
                          <label htmlFor='liveEndTime' className='block text-sm font-medium mb-1'>End Time</label>
                          <Field name='liveEndTime' type='time' className='w-full border rounded px-3 py-2 outline-none focus:border-blue-500' />
                        </div>
                      </div>

                      <div className='border-t pt-3'>
                        <label htmlFor='maxReschedules' className='block text-sm font-medium mb-1'>
                          How many times can a student reschedule?
                        </label>
                        <Field name='maxReschedules' type='number' min='0' onWheel={(e) => e.target.blur()} className='w-full border rounded px-3 py-2 outline-none focus:border-blue-500' />
                      </div>

                      <div className='grid grid-cols-2 gap-3'>
                        <div>
                          <label htmlFor='rescheduleWindowStart' className='block text-sm font-medium mb-1'>Makeup Slots Start</label>
                          <Field name='rescheduleWindowStart' type='time' className='w-full border rounded px-3 py-2 outline-none focus:border-blue-500' />
                        </div>
                        <div>
                          <label htmlFor='rescheduleWindowEnd' className='block text-sm font-medium mb-1'>Makeup Slots End</label>
                          <Field name='rescheduleWindowEnd' type='time' className='w-full border rounded px-3 py-2 outline-none focus:border-blue-500' />
                        </div>
                      </div>
                    </div>
                  )}

                  {editingCourse.recordedVideoAvailable && (
                    <div className='bg-blue-50 rounded-md p-4'>
                      <label htmlFor='recordedFee' className='block text-sm font-medium mb-1'>Recorded Video Fee (₹)</label>
                      <Field name='recordedFee' type='number' onWheel={(e) => e.target.blur()} className='w-full border rounded px-3 py-2 outline-none focus:border-blue-500' />
                      <ErrorMessage name='recordedFee' component='p' className='text-red-600 text-sm mt-1' />
                    </div>
                  )}

                  <div className='flex gap-3 mt-2'>
                    <button
                      type='button'
                      onClick={() => setEditingCourse(null)}
                      className='flex-1 border py-2 rounded text-sm font-medium hover:bg-gray-50'
                    >
                      Cancel
                    </button>
                    <button
                      type='submit'
                      disabled={isSubmitting}
                      className='flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 text-sm font-medium disabled:opacity-50'
                    >
                      {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      )}
    </div>
  )
}

export default Courses