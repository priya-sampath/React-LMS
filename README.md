# LMS — Learning Management System

A full-stack Learning Management System (LMS) connecting students with tutors for live and recorded online lessons.

The platform includes course browsing, secure payments, live video classes, rescheduling, recordings, certificates, ratings, and an admin panel to manage the entire platform.

## 📑 Table of Contents

- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Features](#-features)
  - [Module 1 — Authentication & Account Management](#module-1--authentication--account-management)
  - [Module 2 — Tutor Dashboard](#module-2--tutor-dashboard)
  - [Module 3 — Student Dashboard](#module-3--student-dashboard)
  - [Module 4 — Reschedule System](#module-4--the-reschedule-system)
  - [Module 5 — Payments](#module-5--payments)
  - [Module 6 — Certificates](#module-6--certificates)
  - [Module 7 — Admin Panel](#module-7--admin-panel)
- [Live Video Architecture](#-live-video-architecture)
- [Known Limitations](#-known-limitations)

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Backend Runtime | Node.js (ES Modules) |
| Backend Framework | Express 5 |
| Database | MongoDB (Mongoose) |
| Authentication | JSON Web Tokens (JWT), bcryptjs |
| Backend Validation | Yup |
| Email | Nodemailer (Gmail SMTP) |
| File Storage | Cloudinary |
| Payments | Razorpay |
| Live Video | VideoSDK.live |
| PDF Generation | PDFKit |
| Frontend Build Tool | Vite |
| Frontend Framework | React 19 |
| Styling | Tailwind CSS v4 |
| Routing | React Router DOM v7 |
| Forms & Validation | Formik + Yup |
| HTTP Client | Axios |

---

## 📁 Project Structure

```text
LMS/
├── backend/
│   ├── controllers/     # Business logic per feature
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express route definitions
│   ├── middleware/      # Authentication, role checks, file upload
│   ├── utils/           # Cloudinary, Razorpay, VideoSDK, PDF, scheduling helpers
│   ├── emailVerify/     # Email-sending functions
│   ├── database/        # MongoDB connection
│   └── server.js        # Application entry point
│
└── frontend/
    └── src/
        ├── pages/
        │   ├── auth/     # Login, Signup, VerifyEmail, etc.
        │   ├── student/  # Student dashboard and pages
        │   ├── tutor/    # Tutor dashboard and pages
        │   └── admin/    # Admin dashboard and pages
        ├── components/   # Shared components
        └── utils/        # Axios instance and auth session storage
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed or configured:

- Node.js (v18 or later recommended)
- MongoDB (local installation or MongoDB Atlas)
- Cloudinary account
- Razorpay account
- VideoSDK account
- Gmail app password for email verification

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/LMS.git
cd LMS
```

#### 2. Backend Setup

```bash
cd backend
npm install
npm run dev
```

#### 3. Frontend Setup

Open a separate terminal:

```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```

**Note:** `--legacy-peer-deps` is required because VideoSDK is not yet certified for React 19.


# ✨ Features

## Module 1 — Authentication & Account Management

Authentication is available for students, tutors, and administrators.

| Feature | Description |
|---|---|
| Registration | Students and tutors can register by selecting their role. Admins cannot self-register. Passwords are hashed using bcrypt. |
| Email Verification | A short-lived JWT verification link is sent to the user's email. Accounts cannot log in until verified. |
| Login | Validates credentials, blocks unverified or deactivated accounts, and issues access and refresh tokens. |
| Forgot Password | Sends a 6-digit OTP valid for 10 minutes. Users verify the OTP before setting a new password. |
| Refresh Token | Generates a new access token without requiring the user to log in again. |
| Profile Management | Users can view and update their username, bio, and avatar. Tutors can additionally manage qualifications, expertise tags, and years of experience. |
| Account Deactivation | Supports self-service soft deletion. The account is deactivated, preventing future logins while preserving existing data. |
| Session Persistence | Login state is stored in `sessionStorage`. It survives page refreshes and clears when the browser tab closes. |

### Token Configuration

- Access token: 10 days
- Refresh token: 30 days

---

## Module 2 — Tutor Dashboard

### My Courses

Tutors can create, manage, activate, deactivate, and delete their courses.

#### Create a Course

Each course includes:

- Title
- Description
- Mandatory notes document (PDF, DOC, or DOCX)
- Live class option
- Recorded video option

#### Live Classes

When enabled, tutors can configure:

- Course fee
- Start and end dates
- Weekly available days
- Class time
- Maximum number of reschedules per student
- Daily rescheduling window

#### Recorded Videos

When enabled, tutors can:

- Set the recorded course fee
- Upload an initial video

If both live classes and recorded videos are disabled, the course is free and provides notes only.

#### Course Management

- Edit course title, description, fees, and live schedule.
- Activate or deactivate courses.
- Only active courses appear in student search.
- Soft-delete courses while preserving access for students who have already paid.

**Note:** Uploaded files cannot be replaced during course editing. The course must be deleted and recreated if a file needs to be changed.

### Live Class Management

- Lists all live-enabled courses.
- Tutors can start classes only during the scheduled time or an active rescheduled one-on-one slot.
- Scheduling restrictions are enforced on both the frontend and backend.
- Provides a custom-built video call interface using VideoSDK.
- Tutors can mute participants, disable their cameras, or remove them from the class.
- Supports cloud recording through VideoSDK.

After a tutor ends a recorded class, the backend automatically polls VideoSDK for the completed recording and saves it once ready.

### Recordings

Tutors can:

- Select a course from a dropdown.
- View all past recorded sessions.
- Access regular class recordings.
- View rescheduled one-on-one recordings labeled with the corresponding student.

### Students

Tutors can view all students enrolled across their courses, along with their progress.

### Payments

Tutors can view:

- All payments received
- Total revenue

### Reviews

Tutors can view ratings and comments submitted by students after completing a course.

---

## Module 3 — Student Dashboard

### Browse Tutors

Students can:

- Search and filter tutors by subject or expertise tag.
- Filter tutors by minimum rating.
- Sort tutors by rating, experience, or newest.
- View public tutor profiles.

Tutor profiles include:

- Bio
- Qualifications
- Expertise
- Active courses
- Student reviews

### Search Courses

Students can search courses by title.

Each course displays its available options:

- Live classes
- Recorded videos
- Notes-only access

Pricing is displayed for each option.

### Enrollment

Students can select:

- Live classes
- Recorded videos
- Both options
- Neither option (notes-only, free)

The total fee is calculated based on the selected options.

### Secure Payment & Enrollment

- Paid enrollment opens the Razorpay checkout widget directly on the page.
- No external redirect is required.
- The backend verifies Razorpay's cryptographic signature before creating an enrollment.
- Client-side payment success alone cannot create a valid enrollment.

### My Courses

Students can:

| Feature | Description |
|---|---|
| View Notes | Opens the tutor's uploaded notes document. |
| Join Live Class | Available only when the class is live and the student has the appropriate enrollment. |
| Reschedule | Allows students to reschedule eligible live sessions. |
| Watch Videos | Provides access to purchased recorded videos. |
| Past Live Sessions | Displays recordings of regular classes and the student's own private rescheduled sessions. |
| Leave Review | Allows students to submit a star rating and comment once per course. |
| Get Certificate | Downloads a PDF certificate after course completion. |

### Payments

The student payment dashboard contains two tabs:

- **Pending:** Checkout started but not completed.
- **Completed:** Successfully verified payments.

---

## Module 4 — The Reschedule System

The rescheduling system manages individual student makeup sessions while preventing double-booking.

### Tutor Configuration

When enabling live classes, tutors configure:

- `maxReschedules`: Maximum reschedules allowed per student.
- `rescheduleWindowStart`: Daily rescheduling window start time.
- `rescheduleWindowEnd`: Daily rescheduling window end time.

The rescheduling window is separate from the regular class schedule and is used only for makeup sessions.

### Slot Generation

The rescheduling window is divided into fixed-length slots matching the regular class duration.

For example:

A 1-hour class within a 9 AM–6 PM rescheduling window generates 9 available slots.

### Reschedule Availability

The reschedule button appears:

- Only on the student's scheduled class day.
- Only between the rescheduling window start time and the regular class start time.

For example, if a class starts at 5 PM and the rescheduling window begins at 9 AM, the button is available between 9 AM and 5 PM.

### Slot Selection

- Candidate dates are generated from future dates within the course date range.
- Only the tutor's teaching days are considered.
- Dates with all slots booked are disabled.
- If every eligible date is fully booked, rescheduling becomes unavailable.

### Preventing Double-Booking

A unique database index on:

```text
(courseId, date, slotTime)
```

ensures that two students cannot claim the same rescheduling slot, even during concurrent requests.

### Private Rescheduled Recordings

If a tutor starts a live class during a student's rescheduled slot:

- The recording is tagged with `isRescheduled: true`.
- The recording is accessible only to that specific student.
- Other students cannot access the private makeup session.

---

## Module 5 — Payments

The platform integrates Razorpay for secure online payments.

### Payment Workflow

1. The backend creates a Razorpay order using the Orders API.
2. A pending Payment record is created when checkout begins.
3. The frontend opens Razorpay's checkout widget.
4. After payment, the frontend sends Razorpay's response to the backend.
5. The backend recomputes the HMAC signature using the secret key.
6. The payment is confirmed only if the signature matches.
7. The Payment record is marked as paid.
8. An Enrollment record is created.
9. A payment confirmation email is sent automatically.

This server-side verification prevents fake client-side payment success responses from creating enrollments.

---

## Module 6 — Certificates

The platform automatically generates PDF certificates when students complete their courses.

### Course Completion Rules

There is no manual grading or scoring system.

A course is considered complete when:

- **Live courses:** The current date is past the scheduled end date.
- **Notes-only or recorded-only courses:** Completion is immediate upon enrollment.

### Certificate Generation

- A Certificate record is created the first time completion is detected.
- Each certificate receives a unique ID.

Example:

```text
CERT-A1B2C3D4
```

### PDF Certificate

The certificate includes:

- Academy name
- Student name
- Course title
- Tutor name
- Completion date
- Certificate ID

Certificates are generated dynamically using PDFKit whenever a student downloads them. The generated PDF is not stored as a file.

---

## Module 7 — Admin Panel

The admin panel provides centralized management of users and courses.

| Feature | Description |
|---|---|
| Dashboard | Displays the total number of tutors, students, and courses. |
| User Management | View all tutors and students, activate or deactivate accounts, and reassign roles. |
| Role Management | Supports changing roles between student, tutor, and admin. |
| User Deletion | Permanently deletes users and their associated courses, enrollments, payments, and certificates. |
| Course Management | View all courses across tutors and permanently delete any course. |

**Note:** Admin deletion is a hard delete. This differs from a tutor's soft deletion, which preserves access for students who have already paid.

---

## 🎥 Live Video Architecture

The platform uses VideoSDK.live with a custom-built React video meeting interface.

### Room Management

- One persistent VideoSDK room is created per course when live classes are enabled.
- The room is reused for regular classes and eligible rescheduled sessions.

### Custom Video Call UI

Instead of using a prebuilt embed, the platform uses VideoSDK's React hooks to create a custom video call interface.

This provides control over moderator permissions, including:

- `disableMic()`
- `disableWebcam()`
- `remove()`

### Token-Based Access

- Tokens are generated on demand by the backend.
- Tutors request a token when clicking **Start Live Class**.
- Students request a token when clicking **Join**.
- Tokens are short-lived and room-scoped.
- Tutor tokens include the `allow_mod` permission.
- Student tokens do not include moderator permissions.
- Users cannot join without backend authorization.

---

## ⚠️ Known Limitations

- Individual lesson booking and cancellation outside the recurring weekly schedule and rescheduling system are not implemented.
---

## 👩‍💻 Author

Developed as a full-stack Learning Management System project using the MERN stack and integrated third-party services.

