import React, { useEffect, useState } from 'react'
import { axiosInstance } from '../../utils/axiosInstance'
import { getAccessToken } from '../../utils/authStore'

const Payments = () => {
  const [payments, setPayments] = useState([])
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const token = getAccessToken()
        const res = await axiosInstance.get('/payments/my-revenue', {
          headers: { Authorization: `Bearer ${token}` }
        })
        setPayments(res.data.data)
        setTotalRevenue(res.data.totalRevenue)
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load payments')
      } finally {
        setLoading(false)
      }
    }
    fetchRevenue()
  }, [])

  if (loading) {
    return <p className='text-gray-500'>Loading payments...</p>
  }

  return (
    <div>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold'>Payments</h1>
        <div className='bg-white rounded-lg shadow-sm px-5 py-3'>
          <p className='text-sm text-gray-500'>Total Revenue</p>
          <p className='text-xl font-bold'>₹{totalRevenue.toLocaleString()}</p>
        </div>
      </div>

      {error && (
        <p className='bg-red-100 text-red-700 text-sm p-2 rounded mb-4'>{error}</p>
      )}

      {payments.length === 0 ? (
        <p className='text-gray-500'>No payments yet.</p>
      ) : (
        <div className='bg-white rounded-lg shadow-sm overflow-hidden'>
          <table className='w-full text-sm'>
            <thead className='bg-gray-50 text-left text-gray-500'>
              <tr>
                <th className='px-4 py-3'>Student</th>
                <th className='px-4 py-3'>Course</th>
                <th className='px-4 py-3'>Amount</th>
                <th className='px-4 py-3'>Date</th>
                <th className='px-4 py-3'>Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className='border-t'>
                  <td className='px-4 py-3 font-medium'>{payment.student}</td>
                  <td className='px-4 py-3'>{payment.course}</td>
                  <td className='px-4 py-3'>₹{payment.amount}</td>
                  <td className='px-4 py-3 text-gray-500'>{new Date(payment.date).toLocaleDateString()}</td>
                  <td className='px-4 py-3'>
                    <span
                      className={`text-xs px-3 py-1 rounded-full ${
                        payment.status === 'paid'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {payment.status}
                    </span>
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

export default Payments