import React, { useEffect, useState } from 'react'
import { axiosInstance } from '../../utils/axiosInstance'
import { getAccessToken } from '../../utils/authStore'

const Courses = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  const fetchCourses = async () => {
    try {
      const token = getAccessToken()
      const res = await axiosInstance.get('/admin/courses', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setCourses(res.data.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load courses')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  const handleDelete = async (course) => {
    const confirmed = window.confirm(
      `Permanently delete "${course.title}"? This will also remove its enrollments, payments, and scores.`
    )
    if (!confirmed) return

    setDeletingId(course._id)
    try {
      const token = getAccessToken()
      await axiosInstance.delete(`/admin/courses/${course._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setCourses((prev) => prev.filter((c) => c._id !== course._id))
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete course')
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return <p className='text-gray-500'>Loading courses...</p>
  }

  return (
    <div>
      <h1 className='text-2xl font-bold mb-6'>Courses ({courses.length})</h1>

      {error && (
        <p className='bg-red-100 text-red-700 text-sm p-2 rounded mb-4'>{error}</p>
      )}

      {courses.length === 0 ? (
        <p className='text-gray-500'>No courses found.</p>
      ) : (
        <div className='bg-white rounded-lg shadow-sm overflow-hidden'>
          <table className='w-full text-sm'>
            <thead className='bg-gray-50 text-left text-gray-500'>
              <tr>
                <th className='px-4 py-3'>Title</th>
                <th className='px-4 py-3'>Tutor</th>
                <th className='px-4 py-3'>Fee</th>
                <th className='px-4 py-3'>Status</th>
                <th className='px-4 py-3'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course._id} className='border-t'>
                  <td className='px-4 py-3 font-medium'>{course.title}</td>
                  <td className='px-4 py-3 text-gray-500'>{course.tutorId?.username}</td>
                  <td className='px-4 py-3'>
                    {course.liveClassAvailable ? `Live ₹${course.liveFee}` : ''}
                    {course.liveClassAvailable && course.recordedVideoAvailable ? ' / ' : ''}
                    {course.recordedVideoAvailable ? `Recorded ₹${course.recordedFee}` : ''}
                    {!course.liveClassAvailable && !course.recordedVideoAvailable ? 'Free' : ''}
                  </td>
                  <td className='px-4 py-3'>
                    <span
                      className={`text-xs px-3 py-1 rounded-full ${
                        course.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : course.status === 'deleted'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {course.status}
                    </span>
                  </td>
                  <td className='px-4 py-3'>
                    <button
                      onClick={() => handleDelete(course)}
                      disabled={deletingId === course._id}
                      className='border border-red-600 text-red-600 px-3 py-1 rounded text-xs font-medium hover:bg-red-50 disabled:opacity-50'
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default Courses
