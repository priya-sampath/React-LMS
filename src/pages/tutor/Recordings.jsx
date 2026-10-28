import React, { useEffect, useState } from 'react'
import { axiosInstance } from '../../utils/axiosInstance'
import { getAccessToken } from '../../utils/authStore'

const Recordings = () => {
  const [courses, setCourses] = useState([])
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [recordings, setRecordings] = useState([])
  const [loadingCourses, setLoadingCourses] = useState(true)
  const [loadingRecordings, setLoadingRecordings] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = getAccessToken()
        const res = await axiosInstance.get('/courses/my-courses', {
          headers: { Authorization: `Bearer ${token}` }
        })
        const liveCourses = res.data.data.filter((c) => c.liveClassAvailable && c.status !== 'deleted')
        setCourses(liveCourses)
        if (liveCourses.length > 0) {
          setSelectedCourseId(liveCourses[0]._id)
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load courses')
      } finally {
        setLoadingCourses(false)
      }
    }
    fetchCourses()
  }, [])

  useEffect(() => {
    if (!selectedCourseId) return

    const fetchRecordings = async () => {
      setLoadingRecordings(true)
      setError('')
      try {
        const token = getAccessToken()
        const res = await axiosInstance.get(`/courses/${selectedCourseId}/session-recordings`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setRecordings(res.data.data)
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load recordings')
      } finally {
        setLoadingRecordings(false)
      }
    }
    fetchRecordings()
  }, [selectedCourseId])

  if (loadingCourses) {
    return <p className='text-gray-500'>Loading courses...</p>
  }

  return (
    <div>
      <h1 className='text-2xl font-bold mb-6'>Recordings</h1>

      {courses.length === 0 ? (
        <p className='text-gray-500'>
          None of your courses have live classes enabled, so there's nothing to record yet.
        </p>
      ) : (
        <>
          <div className='mb-6'>
            <label htmlFor='course' className='block text-sm font-medium mb-1'>Course</label>
            <select
              id='course'
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className='w-full max-w-sm border rounded px-3 py-2 outline-none focus:border-blue-500'
            >
              {courses.map((course) => (
                <option key={course._id} value={course._id}>{course.title}</option>
              ))}
            </select>
          </div>

          {error && (
            <p className='bg-red-100 text-red-700 text-sm p-2 rounded mb-4'>{error}</p>
          )}

          <div className='bg-white rounded-lg shadow-sm p-6'>
            {loadingRecordings ? (
              <p className='text-gray-500 text-sm'>Loading recordings...</p>
            ) : recordings.length === 0 ? (
              <p className='text-gray-500 text-sm'>
                No recordings saved for this course yet. Click "Start Recording" during a live class to create one.
              </p>
            ) : (
              <div className='flex flex-col gap-4'>
                {recordings.map((recording) => (
                  <div key={recording.id} className='border rounded-md p-3'>
                    <p className='text-sm font-medium mb-2'>
                      {new Date(recording.date).toLocaleDateString()}{' '}
                      {new Date(recording.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {recording.isRescheduled && (
                        <span className='ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full'>
                          Rescheduled session{recording.studentName ? ` — ${recording.studentName}` : ''}
                        </span>
                      )}
                    </p>
                    <video controls className='w-full max-w-md rounded'>
                      <source src={recording.videoUrl} />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default Recordings