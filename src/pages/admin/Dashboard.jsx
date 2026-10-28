import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { axiosInstance } from '../../utils/axiosInstance'
import { getAccessToken } from '../../utils/authStore'

const StatCard = ({ label, value, to }) => (
  <Link to={to} className='bg-white rounded-lg shadow-sm p-5 hover:shadow-md transition-shadow'>
    <p className='text-sm text-gray-500'>{label}</p>
    <p className='text-3xl font-bold mt-1'>{value}</p>
  </Link>
)

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = getAccessToken()
        const res = await axiosInstance.get('/admin/dashboard-stats', {
          headers: { Authorization: `Bearer ${token}` }
        })
        setStats(res.data.data)
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load dashboard')
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return <p className='text-gray-500'>Loading dashboard...</p>
  }

  return (
    <div>
      <h1 className='text-2xl font-bold mb-6'>Dashboard</h1>

      {error && (
        <p className='bg-red-100 text-red-700 text-sm p-2 rounded mb-4'>{error}</p>
      )}

      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
        <StatCard label='Total Tutors' value={stats?.totalTutors ?? 0} to='/admin/tutors' />
        <StatCard label='Total Students' value={stats?.totalStudents ?? 0} to='/admin/students' />
        <StatCard label='Total Courses' value={stats?.totalCourses ?? 0} to='/admin/courses' />
      </div>
    </div>
  )
}

export default Dashboard
