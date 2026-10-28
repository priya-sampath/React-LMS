import React, { useEffect, useState } from 'react'
import { axiosInstance } from '../../utils/axiosInstance'
import { getAccessToken } from '../../utils/authStore'

const PaymentsTable = ({ payments, emptyMessage }) => {
  if (payments.length === 0) {
    return <p className='text-gray-500'>{emptyMessage}</p>
  }

  return (
    <div className='bg-white rounded-lg shadow-sm overflow-hidden'>
      <table className='w-full text-sm'>
        <thead className='bg-gray-50 text-left text-gray-500'>
          <tr>
            <th className='px-4 py-3'>Course</th>
            <th className='px-4 py-3'>Amount</th>
            <th className='px-4 py-3'>Date</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => (
            <tr key={payment.id} className='border-t'>
              <td className='px-4 py-3 font-medium'>{payment.course}</td>
              <td className='px-4 py-3'>₹{payment.amount}</td>
              <td className='px-4 py-3 text-gray-500'>
                {new Date(payment.date).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const Payments = () => {
  const [data, setData] = useState({ pending: [], completed: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('pending')

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const token = getAccessToken()
        const res = await axiosInstance.get('/student/my-payments', {
          headers: { Authorization: `Bearer ${token}` }
        })
        setData(res.data.data)
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load payments')
      } finally {
        setLoading(false)
      }
    }
    fetchPayments()
  }, [])

  if (loading) {
    return <p className='text-gray-500'>Loading payments...</p>
  }

  return (
    <div>
      <h1 className='text-2xl font-bold mb-6'>Payments</h1>

      {error && (
        <p className='bg-red-100 text-red-700 text-sm p-2 rounded mb-4'>{error}</p>
      )}

      <div className='flex gap-2 mb-6 border-b'>
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            activeTab === 'pending'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Pending ({data.pending.length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            activeTab === 'completed'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Completed ({data.completed.length})
        </button>
      </div>

      {activeTab === 'pending' ? (
        <PaymentsTable payments={data.pending} emptyMessage="You have no pending payments. Nice." />
      ) : (
        <PaymentsTable payments={data.completed} emptyMessage="No completed payments yet." />
      )}
    </div>
  )
}

export default Payments
