

const STORAGE_KEY = 'lms_auth'

const read = () => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : { accessToken: null, refreshToken: null, user: null }
  } catch {
    return { accessToken: null, refreshToken: null, user: null }
  }
}

const write = (data) => {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export const setAuth = ({ accessToken, refreshToken, user }) => {
  const current = read()
  write({
    accessToken: accessToken ?? current.accessToken,
    refreshToken: refreshToken ?? current.refreshToken,
    user: user ?? current.user,
  })
}

export const getAccessToken = () => read().accessToken
export const getRefreshToken = () => read().refreshToken
export const getUser = () => read().user

export const clearAuth = () => {
  sessionStorage.removeItem(STORAGE_KEY)
}