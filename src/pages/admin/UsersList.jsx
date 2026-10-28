import React, { useEffect, useState } from 'react'
import { axiosInstance } from '../../utils/axiosInstance'
import { getAccessToken } from '../../utils/authStore'

const UsersList = ({ role, title }) => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actioningId, setActioningId] = useState(null)

  const fetchUsers = async () => {
    setLoading(true)
    setError('')
    try {
      const token = getAccessToken()
      const res = await axiosInstance.get('/admin/users', {
        params: { role },
        headers: { Authorization: `Bearer ${token}` }
      })
      setUsers(res.data.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [role])

  const toggleStatus = async (user) => {
    const newStatus = user.status === 'active' ? 'deactivated' : 'active'
    setActioningId(user._id)
    try {
      const token = getAccessToken()
      await axiosInstance.patch(
        `/admin/users/${user._id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, status: newStatus } : u))
      )
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update status')
    } finally {
      setActioningId(null)
    }
  }

  const handleDelete = async (user) => {
    const confirmed = window.confirm(
      `Permanently delete ${user.username}'s account? This cannot be undone — all their courses/enrollments/payments will be removed too.`
    )
    if (!confirmed) return

    setActioningId(user._id)
    try {
      const token = getAccessToken()
      await axiosInstance.delete(`/admin/users/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUsers((prev) => prev.filter((u) => u._id !== user._id))
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete user')
    } finally {
      setActioningId(null)
    }
  }

  const handleRoleChange = async (user, newRole) => {
    if (newRole === user.role) return
    const confirmed = window.confirm(`Change ${user.username}'s role to ${newRole}?`)
    if (!confirmed) return

    setActioningId(user._id)
    try {
      const token = getAccessToken()
      await axiosInstance.patch(
        `/admin/users/${user._id}/role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setUsers((prev) => prev.map((u) => (u._id === user._id ? { ...u, role: newRole } : u)))
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update role')
    } finally {
      setActioningId(null)
    }
  }

  if (loading) {
    return <p className='text-gray-500'>Loading {title.toLowerCase()}...</p>
  }

  return (
    <div>
      <h1 className='text-2xl font-bold mb-6'>{title} ({users.length})</h1>

      {error && (
        <p className='bg-red-100 text-red-700 text-sm p-2 rounded mb-4'>{error}</p>
      )}

      {users.length === 0 ? (
        <p className='text-gray-500'>No {title.toLowerCase()} found.</p>
      ) : (
        <div className='bg-white rounded-lg shadow-sm overflow-hidden'>
          <table className='w-full text-sm'>
            <thead className='bg-gray-50 text-left text-gray-500'>
              <tr>
                <th className='px-4 py-3'>Username</th>
                <th className='px-4 py-3'>Email</th>
                <th className='px-4 py-3'>Role</th>
                <th className='px-4 py-3'>Verified</th>
                <th className='px-4 py-3'>Status</th>
                <th className='px-4 py-3'>Joined</th>
                <th className='px-4 py-3'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className='border-t'>
                  <td className='px-4 py-3 font-medium'>{user.username}</td>
                  <td className='px-4 py-3 text-gray-500'>{user.email}</td>
                  <td className='px-4 py-3'>
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user, e.target.value)}
                      disabled={actioningId === user._id}
                      className='border rounded px-2 py-1 text-xs disabled:opacity-50'
                    >
                      <option value='student'>student</option>
                      <option value='tutor'>tutor</option>
                      <option value='admin'>admin</option>
                    </select>
                  </td>
                  <td className='px-4 py-3'>{user.isVerified ? 'Yes' : 'No'}</td>
                  <td className='px-4 py-3'>
                    <span
                      className={`text-xs px-3 py-1 rounded-full ${
                        user.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className='px-4 py-3 text-gray-500'>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className='px-4 py-3'>
                    <div className='flex gap-2'>
                      <button
                        onClick={() => toggleStatus(user)}
                        disabled={actioningId === user._id}
                        className='border px-3 py-1 rounded text-xs font-medium hover:bg-gray-50 disabled:opacity-50'
                      >
                        {user.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDelete(user)}
                        disabled={actioningId === user._id}
                        className='border border-red-600 text-red-600 px-3 py-1 rounded text-xs font-medium hover:bg-red-50 disabled:opacity-50'
                      >
                        Delete
                      </button>
                    </div>
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

export default UsersList
