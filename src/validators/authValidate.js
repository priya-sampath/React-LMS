import * as yup from "yup"

export const signupSchema = yup.object({
  username: yup
    .string()
    .trim()
    .min(3, 'Username must be atleast 3 characters')
    .required('Username is required'),
  email: yup
    .string()
    .trim()
    .email('Please enter a valid email')
    .required('Email is required'),
  password: yup
    .string()
    .min(8, 'Password must be atleast 8 characters')
    .required('Password is required'),
  role: yup
    .string()
    .oneOf(['student', 'tutor'], 'Invalid role')
    .required('Role is required'),
})

export const loginSchema = yup.object({
  email: yup
    .string()
    .trim()
    .email('Please enter a valid email')
    .required('Email is required'),
  password: yup
    .string()
    .required('Password is required'),
})

export const forgotPasswordSchema = yup.object({
  email: yup
    .string()
    .trim()
    .email('Please enter a valid email')
    .required('Email is required'),
})

export const otpSchema = yup.object({
  otp: yup
    .string()
    .trim()
    .length(6, 'OTP must be 6 digits')
    .required('OTP is required'),
})

export const resetPasswordSchema = yup.object({
  newPassword: yup
    .string()
    .min(8, 'Password must be atleast 8 characters')
    .required('New password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('newPassword')], 'Passwords do not match')
    .required('Confirm password is required'),
})
