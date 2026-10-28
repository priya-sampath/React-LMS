import React, { useEffect, useState } from 'react'
import { axiosInstance } from '../../utils/axiosInstance'
import { getAccessToken, getUser } from '../../utils/authStore'

const Reviews = () => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const token = getAccessToken()
        const user = getUser() || {}
        const res = await axiosInstance.get(`/tutors/${user._id}/reviews`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setReviews(res.data.data)
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load reviews')
      } finally {
        setLoading(false)
      }
    }
    fetchReviews()
  }, [])

  if (loading) {
    return <p className='text-gray-500'>Loading reviews...</p>
  }

  return (
    <div>
      <h1 className='text-2xl font-bold mb-6'>Reviews</h1>

      {error && (
        <p className='bg-red-100 text-red-700 text-sm p-2 rounded mb-4'>{error}</p>
      )}

      {reviews.length === 0 ? (
        <p className='text-gray-500'>No reviews yet.</p>
      ) : (
        <div className='flex flex-col gap-3'>
          {reviews.map((review) => (
            <div key={review.id} className='bg-white rounded-lg shadow-sm p-5'>
              <div className='flex justify-between items-start'>
                <div>
                  <p className='font-medium'>{review.student}</p>
                  <p className='text-sm text-gray-500'>{review.course}</p>
                </div>
                <span className='text-yellow-400 text-lg'>
                  {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                </span>
              </div>
              {review.comment && (
                <p className='text-sm text-gray-600 mt-2'>{review.comment}</p>
              )}
              <p className='text-xs text-gray-400 mt-2'>{new Date(review.date).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Reviews
