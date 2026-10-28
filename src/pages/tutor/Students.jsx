import React, { useEffect, useState } from 'react'
import { axiosInstance } from '../../utils/axiosInstance'
import { getAccessToken } from '../../utils/authStore'

const Students = () => {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = getAccessToken()
        const res = await axiosInstance.get('/enrollments/my-students', {
          headers: { Authorization: `Bearer ${token}` }
        })
        setStudents(res.data.data)
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load students')
      } finally {
        setLoading(false)
      }
    }
    fetchStudents()
  }, [])

  if (loading) {
    return <p className='text-gray-500'>Loading students...</p>
  }

  return (
    <div>
      <h1 className='text-2xl font-bold mb-6'>Students</h1>

      {error && (
        <p className='bg-red-100 text-red-700 text-sm p-2 rounded mb-4'>{error}</p>
      )}

      {students.length === 0 ? (
        <p className='text-gray-500'>No students enrolled in your courses yet.</p>
      ) : (
        <div className='bg-white rounded-lg shadow-sm overflow-hidden'>
          <table className='w-full text-sm'>
            <thead className='bg-gray-50 text-left text-gray-500'>
              <tr>
                <th className='px-4 py-3'>Name</th>
                <th className='px-4 py-3'>Email</th>
                <th className='px-4 py-3'>Course</th>
                <th className='px-4 py-3'>Progress</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id} className='border-t'>
                  <td className='px-4 py-3 font-medium'>{student.name}</td>
                  <td className='px-4 py-3 text-gray-500'>{student.email}</td>
                  <td className='px-4 py-3'>{student.course}</td>
                  <td className='px-4 py-3'>{student.progress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default Students