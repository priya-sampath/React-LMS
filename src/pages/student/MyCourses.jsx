import React, { useEffect, useState } from 'react'
import VideoMeetingRoom from '../../components/VideoMeetingRoom'
import { axiosInstance } from '../../utils/axiosInstance'
import { getAccessToken, getUser } from '../../utils/authStore'

const CertificateButton = ({ courseId }) => {
  const [checking, setChecking] = useState(false)
  const [message, setMessage] = useState('')

  const handleClick = async () => {
    setChecking(true)
    setMessage('')
    try {
      const token = getAccessToken()
      const statusRes = await axiosInstance.get(`/student/courses/${courseId}/certificate`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!statusRes.data.data.completed) {
        setMessage("Not available yet — you'll get your certificate once the course is finished.")
        setChecking(false)
        return
      }

      const fileRes = await axiosInstance.get(
        `/student/certificates/${statusRes.data.data.certificateId}/download`,
        { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' }
      )
      const url = window.URL.createObjectURL(new Blob([fileRes.data], { type: 'application/pdf' }))
      const link = document.createElement('a')
      link.href = url
      link.download = `certificate-${statusRes.data.data.certificateId}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not fetch certificate')
    } finally {
      setChecking(false)
    }
  }

  return (
    <div className='flex flex-col items-end gap-1'>
      <button
        onClick={handleClick}
        disabled={checking}
        className='border border-green-600 text-green-700 px-4 py-2 rounded hover:bg-green-50 text-sm font-medium whitespace-nowrap disabled:opacity-50'
      >
        {checking ? 'Checking...' : 'Get Certificate'}
      </button>
      {message && <p className='text-xs text-gray-500 max-w-[200px] text-right'>{message}</p>}
    </div>
  )
}

const RescheduleModal = ({ courseId, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [data, setData] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const token = getAccessToken()
        const res = await axiosInstance.get(`/student/courses/${courseId}/reschedule-options`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setData(res.data.data)
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load reschedule options')
      } finally {
        setLoading(false)
      }
    }
    fetchOptions()
  }, [courseId])

  const handlePickSlot = async (date, time) => {
    setSubmitting(true)
    setError('')
    try {
      const token = getAccessToken()
      await axiosInstance.post(
        `/student/courses/${courseId}/reschedule`,
        { newDate: date, newSlotTime: time },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      onSuccess()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not reschedule')
    } finally {
      setSubmitting(false)
    }
  }

  const selectedDateData = data?.dates.find((d) => d.date === selectedDate)

  return (
    <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-lg shadow-md w-full max-w-lg p-6 max-h-[85vh] overflow-y-auto'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-xl font-bold'>Reschedule Class</h2>
          <button onClick={onClose} className='text-gray-400 hover:text-gray-600 text-xl'>&times;</button>
        </div>

        {error && (
          <p className='bg-red-100 text-red-700 text-sm p-2 rounded mb-4'>{error}</p>
        )}

        {loading ? (
          <p className='text-sm text-gray-500'>Loading options...</p>
        ) : !data?.dates?.length || !data.anyDateAvailable ? (
          <p className='text-sm text-gray-500'>
            No reschedule dates are available right now — every slot on every available date is fully booked.
          </p>
        ) : (
          <>
            <p className='text-sm text-gray-500 mb-3'>
              {data.remaining} reschedule{data.remaining === 1 ? '' : 's'} remaining. Pick a date, then a slot.
            </p>

            <div className='flex flex-wrap gap-2 mb-4'>
              {data.dates.map((d) => (
                <button
                  key={d.date}
                  disabled={d.fullyBooked}
                  onClick={() => setSelectedDate(d.date)}
                  className={`text-sm px-3 py-1.5 rounded border ${
                    d.fullyBooked
                      ? 'opacity-40 cursor-not-allowed border-gray-200 text-gray-400'
                      : selectedDate === d.date
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {d.date}
                </button>
              ))}
            </div>

            {selectedDateData && (
              <div className='flex flex-wrap gap-2'>
                {selectedDateData.slots.map((slot) => (
                  <button
                    key={slot.time}
                    disabled={slot.taken || submitting}
                    onClick={() => handlePickSlot(selectedDateData.date, slot.time)}
                    className={`text-sm px-3 py-1.5 rounded border ${
                      slot.taken
                        ? 'opacity-40 cursor-not-allowed border-gray-200 text-gray-400'
                        : 'border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    {slot.label} · {slot.time}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

const ReviewForm = ({ courseId, onDone }) => {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    setSubmitting(true)
    setError('')
    try {
      const token = getAccessToken()
      await axiosInstance.post(
        `/student/courses/${courseId}/review`,
        { rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      onDone()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not submit review')
      setSubmitting(false)
    }
  }

  return (
    <div className='mt-4 border-t pt-4'>
      {error && <p className='bg-red-100 text-red-700 text-sm p-2 rounded mb-2'>{error}</p>}
      <div className='flex gap-1 mb-2'>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => setRating(n)}
            className={`text-2xl ${n <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder='How was this course? (optional)'
        rows={2}
        className='w-full border rounded px-3 py-2 text-sm outline-none focus:border-blue-500 mb-2'
      />
      <button
        onClick={handleSubmit}
        disabled={submitting}
        className='bg-blue-600 text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50'
      >
        {submitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </div>
  )
}

const MyCourses = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedCourseId, setExpandedCourseId] = useState(null)
  const [videosByCourse, setVideosByCourse] = useState({})
  const [videosLoading, setVideosLoading] = useState(false)
  const [session, setSession] = useState(null) // { meetingId, token }
  const [joiningId, setJoiningId] = useState(null)
  const [rescheduleCourseId, setRescheduleCourseId] = useState(null)
  const [reviewingCourseId, setReviewingCourseId] = useState(null)
  const [reviewedCourseIds, setReviewedCourseIds] = useState([])
  const [expandedRecordingsId, setExpandedRecordingsId] = useState(null)
  const [recordingsByCourse, setRecordingsByCourse] = useState({})
  const [recordingsLoading, setRecordingsLoading] = useState(false)

  const fetchCourses = async () => {
    try {
      const token = getAccessToken()
      const res = await axiosInstance.get('/student/my-courses', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setCourses(res.data.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load your courses')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  const toggleVideos = async (courseId) => {
    if (expandedCourseId === courseId) {
      setExpandedCourseId(null)
      return
    }
    setExpandedCourseId(courseId)

    if (!videosByCourse[courseId]) {
      setVideosLoading(true)
      try {
        const token = getAccessToken()
        const res = await axiosInstance.get(`/student/courses/${courseId}/videos`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setVideosByCourse((prev) => ({ ...prev, [courseId]: res.data.data }))
      } catch (err) {
        setVideosByCourse((prev) => ({ ...prev, [courseId]: [] }))
      } finally {
        setVideosLoading(false)
      }
    }
  }

  const toggleRecordings = async (courseId) => {
    if (expandedRecordingsId === courseId) {
      setExpandedRecordingsId(null)
      return
    }
    setExpandedRecordingsId(courseId)

    if (!recordingsByCourse[courseId]) {
      setRecordingsLoading(true)
      try {
        const token = getAccessToken()
        const res = await axiosInstance.get(`/student/courses/${courseId}/session-recordings`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setRecordingsByCourse((prev) => ({ ...prev, [courseId]: res.data.data }))
      } catch (err) {
        setRecordingsByCourse((prev) => ({ ...prev, [courseId]: [] }))
      } finally {
        setRecordingsLoading(false)
      }
    }
  }

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

  if (loading) {
    return <p className='text-gray-500'>Loading your courses...</p>
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
      <h1 className='text-2xl font-bold mb-6'>My Courses</h1>

      {error && (
        <p className='bg-red-100 text-red-700 text-sm p-2 rounded mb-4'>{error}</p>
      )}

      {courses.length === 0 ? (
        <p className='text-gray-500'>You're not enrolled in any courses yet.</p>
      ) : (
        <div className='flex flex-col gap-4'>
          {courses.map((course) => (
            <div key={course.id} className='bg-white rounded-lg shadow-sm p-5'>
              <div className='flex justify-between items-start'>
                <div>
                  <p className='font-semibold text-lg'>{course.title}</p>
                  <p className='text-sm text-gray-500 mt-1'>{course.description}</p>
                  <p className='text-sm text-gray-500 mt-2'>Progress: {course.progress}%</p>
                  <span className='inline-block mt-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full'>
                    {[course.wantsLive && 'Live', course.wantsRecorded && 'Recorded', 'Notes']
                      .filter(Boolean)
                      .join(' + ')}
                  </span>
                </div>

                <div className='flex flex-col items-end gap-2'>
                  {course.notesUrl && (
                    <a
                      href={course.notesUrl}
                      target='_blank'
                      rel='noreferrer'
                      className='border px-4 py-2 rounded text-sm font-medium hover:bg-gray-50 whitespace-nowrap'
                    >
                      View Notes
                    </a>
                  )}
                  {course.canJoin && (
                    <button
                      onClick={() => handleJoin(course.id)}
                      disabled={joiningId === course.id}
                      className='bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm font-medium whitespace-nowrap disabled:opacity-50'
                    >
                      {joiningId === course.id ? 'Joining...' : 'Join Live Class'}
                    </button>
                  )}
                  {course.canReschedule && (
                    <button
                      onClick={() => setRescheduleCourseId(course.id)}
                      className='border border-blue-600 text-blue-600 px-4 py-2 rounded hover:bg-blue-50 text-sm font-medium whitespace-nowrap'
                    >
                      Reschedule ({course.remainingReschedules} left)
                    </button>
                  )}
                  {course.wantsLive && (
                    <button
                      onClick={() => toggleRecordings(course.id)}
                      className='border px-4 py-2 rounded text-sm font-medium hover:bg-gray-50 whitespace-nowrap'
                    >
                      {expandedRecordingsId === course.id ? 'Hide Past Sessions' : 'Past Live Sessions'}
                    </button>
                  )}
                  {course.wantsRecorded && (
                    <button
                      onClick={() => toggleVideos(course.id)}
                      className='border px-4 py-2 rounded text-sm font-medium hover:bg-gray-50 whitespace-nowrap'
                    >
                      {expandedCourseId === course.id ? 'Hide Videos' : 'Watch Videos'}
                    </button>
                  )}
                  {!reviewedCourseIds.includes(course.id) && (
                    <button
                      onClick={() => setReviewingCourseId(reviewingCourseId === course.id ? null : course.id)}
                      className='border px-4 py-2 rounded text-sm font-medium hover:bg-gray-50 whitespace-nowrap'
                    >
                      Leave Review
                    </button>
                  )}
                  <CertificateButton courseId={course.id} />
                </div>
              </div>

              {expandedCourseId === course.id && (
                <div className='mt-4 border-t pt-4'>
                  {videosLoading && !videosByCourse[course.id] ? (
                    <p className='text-sm text-gray-500'>Loading videos...</p>
                  ) : videosByCourse[course.id]?.length ? (
                    <div className='flex flex-col gap-3'>
                      {videosByCourse[course.id].map((video, idx) => (
                        <div key={idx} className='border rounded-md p-3'>
                          <p className='text-sm font-medium mb-2'>{video.title}</p>
                          <video controls className='w-full max-w-md rounded'>
                            <source src={video.url} />
                            Your browser does not support the video tag.
                          </video>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className='text-sm text-gray-500'>No recorded videos posted for this course yet.</p>
                  )}
                </div>
              )}

              {expandedRecordingsId === course.id && (
                <div className='mt-4 border-t pt-4'>
                  {recordingsLoading && !recordingsByCourse[course.id] ? (
                    <p className='text-sm text-gray-500'>Loading past sessions...</p>
                  ) : recordingsByCourse[course.id]?.length ? (
                    <div className='flex flex-col gap-3'>
                      {recordingsByCourse[course.id].map((recording) => (
                        <div key={recording.id} className='border rounded-md p-3'>
                          <p className='text-sm font-medium mb-2'>
                            {new Date(recording.date).toLocaleDateString()}
                            {recording.isRescheduled && (
                              <span className='ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full'>
                                Your rescheduled session
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
                  ) : (
                    <p className='text-sm text-gray-500'>No past live session recordings yet.</p>
                  )}
                </div>
              )}

              {reviewingCourseId === course.id && (
                <ReviewForm
                  courseId={course.id}
                  onDone={() => {
                    setReviewedCourseIds((prev) => [...prev, course.id])
                    setReviewingCourseId(null)
                  }}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {rescheduleCourseId && (
        <RescheduleModal
          courseId={rescheduleCourseId}
          onClose={() => setRescheduleCourseId(null)}
          onSuccess={() => {
            setRescheduleCourseId(null)
            fetchCourses()
          }}
        />
      )}
    </div>
  )
}

export default MyCourses
