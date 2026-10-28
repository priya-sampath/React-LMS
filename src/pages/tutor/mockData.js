// Temporary mock data — replace with real API calls once Course/Payment models exist on the backend

export const mockStats = {
  totalRevenue: 48250,
  totalStudents: 132,
  activeCourses: 6,
  upcomingClasses: 3,
}

export const mockUpcomingClasses = [
  { id: 1, course: 'React Fundamentals', date: '2026-07-29', time: '10:00 AM' },
  { id: 2, course: 'Advanced Node.js', date: '2026-07-30', time: '2:00 PM' },
  { id: 3, course: 'MongoDB Deep Dive', date: '2026-08-01', time: '11:30 AM' },
]

export const mockCourses = [
  { id: 1, title: 'React Fundamentals', students: 45, price: 1999, status: 'published' },
  { id: 2, title: 'Advanced Node.js', students: 38, price: 2499, status: 'published' },
  { id: 3, title: 'MongoDB Deep Dive', students: 29, price: 1799, status: 'draft' },
]

export const mockStudents = [
  { id: 1, name: 'Priya S', email: 'priya@example.com', course: 'React Fundamentals', progress: '80%' },
  { id: 2, name: 'Arjun K', email: 'arjun@example.com', course: 'Advanced Node.js', progress: '45%' },
  { id: 3, name: 'Divya R', email: 'divya@example.com', course: 'MongoDB Deep Dive', progress: '100%' },
]

export const mockPayments = [
  { id: 1, student: 'Priya S', course: 'React Fundamentals', amount: 1999, date: '2026-07-20', status: 'paid' },
  { id: 2, student: 'Arjun K', course: 'Advanced Node.js', amount: 2499, date: '2026-07-18', status: 'paid' },
  { id: 3, student: 'Divya R', course: 'MongoDB Deep Dive', amount: 1799, date: '2026-07-15', status: 'pending' },
]
