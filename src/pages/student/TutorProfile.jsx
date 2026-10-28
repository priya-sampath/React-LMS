import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { axiosInstance } from '../../utils/axiosInstance'
import { getAccessToken } from '../../utils/authStore'

const TutorProfile = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tutor, setTutor] = useState(null)
  const [courses, setCourses] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = getAccessToken()
        const headers = { Authorization: `Bearer ${token}` }
        const [profileRes, reviewsRes] = await Promise.all([
          axiosInstance.get(`/tutors/${id}`, { headers }),
          axiosInstance.get(`/tutors/${id}/reviews`, { headers }),
        ])
        setTutor(profileRes.data.data.tutor)
        setCourses(profileRes.data.data.courses)
        setReviews(reviewsRes.data.data)
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load tutor profile')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [id])

  if (loading) {
    return <p className='text-gray-500'>Loading profile...</p>
  }

  if (error) {
    return <p className='bg-red-100 text-red-700 text-sm p-2 rounded'>{error}</p>
  }

  return (
    <div>
      <button onClick={() => navigate(-1)} className='text-sm text-blue-600 hover:underline mb-4'>
        &larr; Back
      </button>

      <div className='bg-white rounded-lg shadow-sm p-6 mb-6'>
        <div className='flex items-center gap-4 mb-4'>
          {tutor.avatarUrl ? (
            <img src={tutor.avatarUrl} alt={tutor.username} className='w-20 h-20 rounded-full object-cover' />
          ) : (
            <div className='w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-2xl'>
              {tutor.username?.[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <h1 className='text-2xl font-bold'>{tutor.username}</h1>
            <p className='text-sm text-gray-500'>{tutor.qualifications}</p>
            {tutor.totalReviews > 0 ? (
              <p className='text-sm text-yellow-500 mt-1'>
                ★ {tutor.averageRating} ({tutor.totalReviews} review{tutor.totalReviews === 1 ? '' : 's'})
              </p>
            ) : (
              <p className='text-sm text-gray-400 mt-1'>No reviews yet</p>
            )}
          </div>
        </div>

        {tutor.bio && <p className='text-sm text-gray-600 mb-3'>{tutor.bio}</p>}
        <p className='text-sm text-gray-500 mb-3'>{tutor.experience} years of experience</p>

        {tutor.expertise?.length > 0 && (
          <div className='flex flex-wrap gap-2'>
            {tutor.expertise.map((subj, idx) => (
              <span key={idx} className='bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full'>
                {subj}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className='bg-white rounded-lg shadow-sm p-6 mb-6'>
        <h2 className='text-lg font-semibold mb-4'>Courses</h2>
        {courses.length === 0 ? (
          <p className='text-sm text-gray-500'>No active courses right now.</p>
        ) : (
          <div className='flex flex-col gap-3'>
            {courses.map((course) => (
              <div key={course._id} className='border rounded-md p-3'>
                <p className='font-medium'>{course.title}</p>
                <p className='text-sm text-gray-500'>{course.description}</p>
                <p className='text-sm text-gray-500 mt-1'>
                  {course.liveClassAvailable && `Live ₹${course.liveFee}`}
                  {course.liveClassAvailable && course.recordedVideoAvailable && ' · '}
                  {course.recordedVideoAvailable && `Recorded ₹${course.recordedFee}`}
                  {!course.liveClassAvailable && !course.recordedVideoAvailable && 'Free (notes only)'}
                </p>
              </div>
            ))}
          </div>
        )}
        <button
          onClick={() => navigate('/student/search')}
          className='mt-4 text-sm text-blue-600 hover:underline'
        >
          Go to Search Courses to enroll
        </button>
      </div>

      <div className='bg-white rounded-lg shadow-sm p-6'>
        <h2 className='text-lg font-semibold mb-4'>Reviews</h2>
        {reviews.length === 0 ? (
          <p className='text-sm text-gray-500'>No reviews yet.</p>
        ) : (
          <div className='flex flex-col gap-3'>
            {reviews.map((review) => (
              <div key={review.id} className='border-t pt-3 first:border-t-0 first:pt-0'>
                <div className='flex justify-between'>
                  <p className='font-medium text-sm'>{review.student}</p>
                  <span className='text-yellow-400 text-sm'>
                    {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                  </span>
                </div>
                {review.comment && <p className='text-sm text-gray-600 mt-1'>{review.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default TutorProfile
