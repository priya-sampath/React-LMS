import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import VideoMeetingRoom from '../../components/VideoMeetingRoom'
import { axiosInstance } from '../../utils/axiosInstance'
import { getAccessToken, getUser } from '../../utils/authStore'

const StatCard = ({ label, value }) => (
  <div className='bg-white rounded-lg shadow-sm p-5'>
    <p className='text-sm text-gray-500'>{label}</p>
    <p className='text-2xl font-bold mt-1'>{value}</p>
  </div>
)

const Overview = () => {
  const [courses, setCourses] = useState([])
  const [pendingPayments, setPendingPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [joiningId, setJoiningId] = useState(null)
  const [session, setSession] = useState(null) // { meetingId, token }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getAccessToken()
        const headers = { Authorization: `Bearer ${token}` }

        const [coursesRes, paymentsRes] = await Promise.all([
          axiosInstance.get('/student/my-courses', { headers }),
          axiosInstance.get('/student/my-payments', { headers }),
        ])

        setCourses(coursesRes.data.data)
        setPendingPayments(paymentsRes.data.data.pending)
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load dashboard')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleJoin = async (courseId) => {
    setJoiningId(courseId)
    setError('')
    try {
      const token = getAccessToken()
      const res = await axiosInstance.post(
        `/student/courses/${courseId}/join-live`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setSession({ meetingId: res.data.meetingId, token: res.data.token })
    } catch (err) {
      setError(err.response?.data?.message || 'Could not join the live class')
    } finally {
      setJoiningId(null)
    }
  }

  const liveNowCourses = courses.filter((course) => course.canJoin)

  if (loading) {
    return <p className='text-gray-500'>Loading dashboard...</p>
  }

  if (session) {
    const user = getUser() || {}
    return (
      <div className='h-[85vh]'>
        <VideoMeetingRoom
          meetingId={session.meetingId}
          token={session.token}
          name={user.username}
          isModerator={false}
          onLeave={() => setSession(null)}
        />
      </div>
    )
  }

  return (
    <div>
      <h1 className='text-2xl font-bold mb-6'>Dashboard</h1>

      {error && (
        <p className='bg-red-100 text-red-700 text-sm p-2 rounded mb-4'>{error}</p>
      )}

      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8'>
        <StatCard label='Enrolled Courses' value={courses.length} />
        <StatCard label='Live Right Now' value={liveNowCourses.length} />
        <StatCard label='Pending Payments' value={pendingPayments.length} />
      </div>

      {liveNowCourses.length > 0 && (
        <div className='bg-white rounded-lg shadow-sm p-6 mb-6'>
          <h2 className='text-lg font-semibold mb-4'>Live Right Now</h2>
          <div className='flex flex-col gap-3'>
            {liveNowCourses.map((course) => (
              <div key={course.id} className='flex justify-between items-center border rounded-md px-4 py-3'>
                <p className='font-medium'>{course.title}</p>
                <button
                  onClick={() => handleJoin(course.id)}
                  disabled={joiningId === course.id}
                  className='bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm font-medium disabled:opacity-50'
                >
                  {joiningId === course.id ? 'Joining...' : 'Join Now'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className='bg-white rounded-lg shadow-sm p-6'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-lg font-semibold'>My Courses</h2>
          <Link to='/student/search' className='text-sm text-blue-600 hover:underline'>
            Find more courses
          </Link>
        </div>
        {courses.length === 0 ? (
          <p className='text-gray-500 text-sm'>You're not enrolled in any courses yet.</p>
        ) : (
          <div className='flex flex-col gap-3'>
            {courses.map((course) => (
              <div key={course.id} className='flex justify-between items-center border rounded-md px-4 py-3'>
                <div>
                  <p className='font-medium'>{course.title}</p>
                  <p className='text-sm text-gray-500'>Progress: {course.progress}%</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Overview