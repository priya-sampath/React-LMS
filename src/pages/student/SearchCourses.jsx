import React, { useEffect, useState } from 'react'
import { axiosInstance } from '../../utils/axiosInstance'
import { getAccessToken, getUser } from '../../utils/authStore'

const SearchCourses = () => {
  const [query, setQuery] = useState('')
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [enrollingId, setEnrollingId] = useState(null)
  const [message, setMessage] = useState('')
  const [selections, setSelections] = useState({}) // { [courseId]: { live: bool, recorded: bool } }

  const fetchCourses = async (searchQuery = '') => {
    setLoading(true)
    setError('')
    try {
      const token = getAccessToken()
      const res = await axiosInstance.get('/courses/search', {
        params: searchQuery ? { query: searchQuery } : {},
        headers: { Authorization: `Bearer ${token}` }
      })
      setCourses(res.data.data)

      const defaults = {}
      res.data.data.forEach((course) => {
        defaults[course._id] = { live: false, recorded: false }
      })
      setSelections(defaults)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load courses')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    fetchCourses(query)
  }

  const toggleOption = (courseId, key) => {
    setSelections((prev) => ({
      ...prev,
      [courseId]: { ...prev[courseId], [key]: !prev[courseId]?.[key] }
    }))
  }

  const feeForCourse = (course) => {
    const sel = selections[course._id] || {}
    return (sel.live ? course.liveFee : 0) + (sel.recorded ? course.recordedFee : 0)
  }

  const handleEnroll = async (course) => {
    setMessage('')
    setEnrollingId(course._id)
    const token = getAccessToken()
    const sel = selections[course._id] || {}

    try {
      const res = await axiosInstance.post(
        `/student/courses/${course._id}/enroll`,
        { wantsLive: !!sel.live, wantsRecorded: !!sel.recorded },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      // free enrollment — nothing more to do
      if (!res.data.order) {
        setMessage(res.data.message)
        setEnrollingId(null)
        return
      }

      // paid — open Razorpay's checkout widget right here on the page
      const user = getUser() || {}
      const options = {
        key: res.data.keyId,
        amount: res.data.order.amount,
        currency: res.data.order.currency,
        name: 'LMS',
        description: res.data.courseName,
        order_id: res.data.order.id,
        prefill: {
          name: user.username,
          email: user.email,
        },
        handler: async (response) => {
          try {
            const verifyRes = await axiosInstance.post(
              '/student/verify-payment',
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                courseId: course._id,
                wantsLive: !!sel.live,
                wantsRecorded: !!sel.recorded,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            )
            setMessage(verifyRes.data.message)
          } catch (err) {
            setMessage(err.response?.data?.message || 'Payment verification failed')
          } finally {
            setEnrollingId(null)
          }
        },
        modal: {
          ondismiss: () => setEnrollingId(null),
        },
        theme: { color: '#2563eb' },
      }

      const razorpayInstance = new window.Razorpay(options)
      razorpayInstance.open()
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not enroll')
      setEnrollingId(null)
    }
  }

  if (loading) {
    return <p className='text-gray-500'>Loading courses...</p>
  }

  return (
    <div>
      <h1 className='text-2xl font-bold mb-6'>Search Courses</h1>

      <form onSubmit={handleSearch} className='flex gap-3 mb-6'>
        <input
          type='text'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Search by course title...'
          className='flex-1 border rounded px-3 py-2 outline-none focus:border-blue-500'
        />
        <button
          type='submit'
          className='bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 text-sm font-medium'
        >
          Search
        </button>
      </form>

      {message && (
        <p className='bg-blue-100 text-blue-700 text-sm p-2 rounded mb-4'>{message}</p>
      )}
      {error && (
        <p className='bg-red-100 text-red-700 text-sm p-2 rounded mb-4'>{error}</p>
      )}

      {courses.length === 0 ? (
        <p className='text-gray-500'>No courses found.</p>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          {courses.map((course) => {
            const hasPaidOption = course.liveClassAvailable || course.recordedVideoAvailable
            const sel = selections[course._id] || {}
            const fee = feeForCourse(course)

            return (
              <div key={course._id} className='bg-white rounded-lg shadow-sm p-5 flex flex-col justify-between'>
                <div>
                  <p className='font-semibold'>{course.title}</p>
                  <p className='text-sm text-gray-500 mt-1'>{course.description}</p>
                  <p className='text-sm text-gray-500 mt-2'>By {course.tutorId?.username}</p>

                  {hasPaidOption ? (
                    <div className='mt-3 flex flex-col gap-2'>
                      {course.liveClassAvailable && (
                        <label className='flex items-center gap-2 text-sm'>
                          <input
                            type='checkbox'
                            checked={!!sel.live}
                            onChange={() => toggleOption(course._id, 'live')}
                            className='accent-blue-600'
                          />
                          Live classes — ₹{course.liveFee}
                        </label>
                      )}
                      {course.recordedVideoAvailable && (
                        <label className='flex items-center gap-2 text-sm'>
                          <input
                            type='checkbox'
                            checked={!!sel.recorded}
                            onChange={() => toggleOption(course._id, 'recorded')}
                            className='accent-blue-600'
                          />
                          Recorded videos — ₹{course.recordedFee}
                        </label>
                      )}
                      <p className='text-xs text-gray-400'>
                        Leave both unchecked to enroll for notes only — free.
                      </p>
                    </div>
                  ) : (
                    <p className='text-sm font-medium mt-3 text-green-700'>Free — Notes only</p>
                  )}
                </div>

                <button
                  onClick={() => handleEnroll(course)}
                  disabled={enrollingId === course._id}
                  className='mt-4 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 text-sm font-medium disabled:opacity-50'
                >
                  {enrollingId === course._id
                    ? 'Please wait...'
                    : fee > 0
                      ? `Enroll — ₹${fee} (Pay with card)`
                      : 'Enroll — Free'}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default SearchCourses
