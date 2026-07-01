import { createContext, useContext, useState, useCallback } from 'react'
import { authApi } from '../api/services'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user')
      return stored ? JSON.parse(stored) : null
    } catch { return null }
  })

  const login = useCallback(async (email, password) => {
    const res = await authApi.login({ email, password })
    const data = res.data.data
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data))
    setUser(data)
    return data
  }, [])

        const updateUserPhoto = useCallback((photoUrl) => {
        setUser(prev => {
          if (!prev) return prev
          const updated = { ...prev, profilePhoto: photoUrl }
          localStorage.setItem('user', JSON.stringify(updated))
          return updated
        })
      }, [])

      const updateUser = useCallback((fields) => {
        setUser(prev => {
          if (!prev) return prev
          const updated = { ...prev, ...fields }
          localStorage.setItem('user', JSON.stringify(updated))
          return updated
        })
      }, [])


  const logout = useCallback(() => {
    localStorage.clear()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout,updateUserPhoto,
  updateUser, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
