import React, { useEffect, useState } from 'react'
import VideoMeetingRoom from '../../components/VideoMeetingRoom'
import { axiosInstance } from '../../utils/axiosInstance'
import { getAccessToken, getUser } from '../../utils/authStore'

const LiveClass = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [session, setSession] = useState(null) // { meetingId, token, sessionRecordingId }
  const [startingId, setStartingId] = useState(null)
  const [savingRecording, setSavingRecording] = useState(false)
  const [recordingMessage, setRecordingMessage] = useState('')

  const fetchCourses = async () => {
    try {
      const token = getAccessToken()
      const res = await axiosInstance.get('/courses/my-courses', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setCourses(res.data.data.filter((c) => c.liveClassAvailable))
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load courses')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  const handleStart = async (course) => {
    setStartingId(course._id)
    setError('')
    setRecordingMessage('')
    try {
      const token = getAccessToken()
      const res = await axiosInstance.post(
        `/courses/${course._id}/start-live`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setSession({
        meetingId: res.data.meetingId,
        token: res.data.token,
        sessionRecordingId: res.data.sessionRecordingId
      })
    } catch (err) {
      setError(err.response?.data?.message || 'Could not start the live class')
    } finally {
      setStartingId(null)
    }
  }

  // recordings take a minute or two to finish processing on VideoSDK's side,
  // so retry a few times with a delay instead of failing on the first miss.
  // NOTE: axios treats HTTP 202 as a success (2xx), not an error — so the
  // retry check has to live in the success branch, not the catch block
  const finalizeRecording = async (recordingId, attempt = 1) => {
    if (!recordingId) return
    setSavingRecording(true)
    try {
      const token = getAccessToken()
      const res = await axiosInstance.post(
        `/courses/recordings/${recordingId}/finalize`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (res.data.success) {
        setRecordingMessage(res.data.message)
        setSavingRecording(false)
        return
      }

      // still processing (202) — retry, or give up with diagnostic info after 6 tries
      if (attempt < 6) {
        setTimeout(() => finalizeRecording(recordingId, attempt + 1), 15000)
      } else {
        console.error('Recording finalize gave up. Last raw VideoSDK response:', res.data.debug)
        setRecordingMessage(
          `${res.data.message} (gave up after 6 tries — check the browser console for details, or confirm you actually clicked "Start Recording" during the class)`
        )
        setSavingRecording(false)
      }
    } catch (err) {
      setRecordingMessage(err.response?.data?.message || 'Could not save the recording')
      setSavingRecording(false)
    }
  }

  if (session) {
    const user = getUser() || {}
    return (
      <div className='h-[85vh]'>
        <VideoMeetingRoom
          meetingId={session.meetingId}
          token={session.token}
          name={user.username}
          isModerator={true}
          onRecordingStopped={() => finalizeRecording(session.sessionRecordingId)}
          onLeave={() => {
            finalizeRecording(session.sessionRecordingId)
            setSession(null)
          }}
        />
      </div>
    )
  }

  return (
    <div>
      <h1 className='text-2xl font-bold mb-6'>Live Class</h1>

      {recordingMessage && (
        <p className='bg-blue-100 text-blue-700 text-sm p-2 rounded mb-4'>{recordingMessage}</p>
      )}
      {savingRecording && (
        <p className='bg-gray-100 text-gray-600 text-sm p-2 rounded mb-4'>Saving recording to course... this can take a minute or two.</p>
      )}
      {error && (
        <p className='bg-red-100 text-red-700 text-sm p-2 rounded mb-4'>{error}</p>
      )}

      <div className='bg-white rounded-lg shadow-sm p-6'>
        <h2 className='text-lg font-semibold mb-4'>Your Live-Enabled Courses</h2>

        {loading ? (
          <p className='text-gray-500 text-sm'>Loading...</p>
        ) : courses.length === 0 ? (
          <p className='text-gray-500 text-sm'>
            None of your courses have live classes enabled yet — turn it on when creating a course.
          </p>
        ) : (
          <div className='flex flex-col gap-3'>
            {courses.map((course) => (
              <div key={course._id} className='flex justify-between items-center border rounded-md px-4 py-3'>
                <div>
                  <p className='font-medium'>{course.title}</p>
                  <p className='text-sm text-gray-500'>
                    {course.liveSchedule?.availableDays?.join(', ')} · {course.liveSchedule?.startTime}–{course.liveSchedule?.endTime}
                  </p>
                </div>
                <button
                  onClick={() => handleStart(course)}
                  disabled={!course.canStartLive || startingId === course._id}
                  title={!course.canStartLive ? "You can only start this during its scheduled day/time" : ''}
                  className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed'
                >
                  {startingId === course._id ? 'Starting...' : 'Start Live Class'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default LiveClass