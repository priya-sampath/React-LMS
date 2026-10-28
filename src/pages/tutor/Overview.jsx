import React, { useEffect, useState } from 'react'
import { axiosInstance } from '../../utils/axiosInstance'
import { getAccessToken } from '../../utils/authStore'

const StatCard = ({ label, value }) => (
  <div className='bg-white rounded-lg shadow-sm p-5'>
    <p className='text-sm text-gray-500'>{label}</p>
    <p className='text-2xl font-bold mt-1'>{value}</p>
  </div>
)

const Overview = () => {
  const [courses, setCourses] = useState([])
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [totalStudents, setTotalStudents] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getAccessToken()
        const headers = { Authorization: `Bearer ${token}` }

        const [coursesRes, revenueRes, studentsRes] = await Promise.all([
          axiosInstance.get('/courses/my-courses', { headers }),
          axiosInstance.get('/payments/my-revenue', { headers }),
          axiosInstance.get('/enrollments/my-students', { headers }),
        ])

        setCourses(coursesRes.data.data.filter((c) => c.status !== 'deleted'))
        setTotalRevenue(revenueRes.data.totalRevenue)
        setTotalStudents(studentsRes.data.data.length)
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load dashboard')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return <p className='text-gray-500'>Loading dashboard...</p>
  }

  const activeCourses = courses.filter((c) => c.status === 'active').length
  const liveCourses = courses.filter((c) => c.liveClassAvailable)

  return (
    <div>
      <h1 className='text-2xl font-bold mb-6'>Dashboard</h1>

      {error && (
        <p className='bg-red-100 text-red-700 text-sm p-2 rounded mb-4'>{error}</p>
      )}

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
        <StatCard label='Total Revenue' value={`₹${totalRevenue.toLocaleString()}`} />
        <StatCard label='Total Students' value={totalStudents} />
        <StatCard label='Active Courses' value={activeCourses} />
        <StatCard label='Live-Enabled Courses' value={liveCourses.length} />
      </div>

      <div className='bg-white rounded-lg shadow-sm p-6'>
        <h2 className='text-lg font-semibold mb-4'>Your Live Courses</h2>
        {liveCourses.length === 0 ? (
          <p className='text-gray-500 text-sm'>None of your courses have live classes enabled yet.</p>
        ) : (
          <div className='flex flex-col gap-3'>
            {liveCourses.map((course) => (
              <div
                key={course._id}
                className='flex justify-between items-center border rounded-md px-4 py-3'
              >
                <div>
                  <p className='font-medium'>{course.title}</p>
                  <p className='text-sm text-gray-500'>
                    {course.liveSchedule?.availableDays?.join(', ')} · {course.liveSchedule?.startTime}–{course.liveSchedule?.endTime}
                  </p>
                </div>
                <span
                  className={`text-xs px-3 py-1 rounded-full ${
                    course.canStartLive ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {course.canStartLive ? 'Live now' : 'Scheduled'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Overview