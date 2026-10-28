import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { axiosInstance } from '../../utils/axiosInstance'
import { getAccessToken } from '../../utils/authStore'

const BrowseTutors = () => {
  const navigate = useNavigate()
  const [subject, setSubject] = useState('')
  const [minRating, setMinRating] = useState('')
  const [sortBy, setSortBy] = useState('')
  const [tutors, setTutors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchTutors = async () => {
    setLoading(true)
    setError('')
    try {
      const token = getAccessToken()
      const params = {}
      if (subject) params.subject = subject
      if (minRating) params.minRating = minRating
      if (sortBy) params.sortBy = sortBy

      const res = await axiosInstance.get('/tutors/search', {
        params,
        headers: { Authorization: `Bearer ${token}` }
      })
      setTutors(res.data.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load tutors')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTutors()
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    fetchTutors()
  }

  return (
    <div>
      <h1 className='text-2xl font-bold mb-6'>Browse Tutors</h1>

      <form onSubmit={handleSearch} className='flex flex-wrap gap-3 mb-6'>
        <input
          type='text'
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder='Search by subject (e.g. React)'
          className='flex-1 min-w-[200px] border rounded px-3 py-2 outline-none focus:border-blue-500'
        />
        <select
          value={minRating}
          onChange={(e) => setMinRating(e.target.value)}
          className='border rounded px-3 py-2 outline-none focus:border-blue-500'
        >
          <option value=''>Any rating</option>
          <option value='4'>4+ stars</option>
          <option value='3'>3+ stars</option>
          <option value='2'>2+ stars</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className='border rounded px-3 py-2 outline-none focus:border-blue-500'
        >
          <option value=''>Sort by rating</option>
          <option value='experience'>Sort by experience</option>
          <option value='newest'>Newest</option>
        </select>
        <button
          type='submit'
          className='bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 text-sm font-medium'
        >
          Search
        </button>
      </form>

      {error && (
        <p className='bg-red-100 text-red-700 text-sm p-2 rounded mb-4'>{error}</p>
      )}

      {loading ? (
        <p className='text-gray-500'>Loading tutors...</p>
      ) : tutors.length === 0 ? (
        <p className='text-gray-500'>No tutors found.</p>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
          {tutors.map((tutor) => (
            <div
              key={tutor._id}
              onClick={() => navigate(`/student/tutors/${tutor._id}`)}
              className='bg-white rounded-lg shadow-sm p-5 cursor-pointer hover:shadow-md transition-shadow'
            >
              <div className='flex items-center gap-3 mb-3'>
                {tutor.avatarUrl ? (
                  <img src={tutor.avatarUrl} alt={tutor.username} className='w-12 h-12 rounded-full object-cover' />
                ) : (
                  <div className='w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold'>
                    {tutor.username?.[0]?.toUpperCase()}
                  </div>
                )}
                <div>
                  <p className='font-semibold'>{tutor.username}</p>
                  <p className='text-xs text-gray-500'>{tutor.experience} yrs experience</p>
                </div>
              </div>

              {tutor.totalReviews > 0 ? (
                <p className='text-sm text-yellow-500 mb-2'>
                  ★ {tutor.averageRating} ({tutor.totalReviews} review{tutor.totalReviews === 1 ? '' : 's'})
                </p>
              ) : (
                <p className='text-sm text-gray-400 mb-2'>No reviews yet</p>
              )}

              {tutor.expertise?.length > 0 && (
                <div className='flex flex-wrap gap-1 mb-2'>
                  {tutor.expertise.slice(0, 4).map((subj, idx) => (
                    <span key={idx} className='bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full'>
                      {subj}
                    </span>
                  ))}
                </div>
              )}

              {tutor.bio && (
                <p className='text-sm text-gray-500 line-clamp-2'>{tutor.bio}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default BrowseTutors
