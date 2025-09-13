"use client"

import { useState, useEffect, createContext, useContext } from "react"
import { dataManager } from "@/lib/data-manager"

const AuthContext = createContext(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function useAuthLogic() {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing user in localStorage
    const savedUser = dataManager.getCurrentUser()
    if (savedUser) {
      setUser(savedUser)
    }
    setIsLoading(false)
  }, [])

  const login = async (email, password) => {
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (email === "" && password === "") {
      // Create a demo user for empty login
      const demoUser = {
        id: "demo-user",
        email: "demo@codequest.com",
        name: "Demo User",
        level: 3,
        coins: 500,
        xp: 2500,
        badges: ["Welcome", "First Steps", "Quick Learner"],
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        preferences: {
          theme: "dark",
          notifications: true,
          soundEffects: true,
          autoSave: true,
        },
      }

      setUser(demoUser)
      dataManager.saveUser(demoUser)
      setIsLoading(false)
      return true
    }

    // Check if user exists
    const users = dataManager.getUsers()
    const existingUser = users.find((u) => u.email === email && u.password === password)

    if (existingUser) {
      const { password: _, ...userWithoutPassword } = existingUser
      const updatedUser = {
        ...userWithoutPassword,
        lastLoginAt: new Date().toISOString(),
      }

      setUser(updatedUser)
      dataManager.saveUser(updatedUser)
      setIsLoading(false)
      return true
    }

    setIsLoading(false)
    return false
  }

  const signup = async (email, password, name) => {
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Check if user already exists
    const users = dataManager.getUsers()
    const existingUser = users.find((u) => u.email === email)

    if (existingUser) {
      setIsLoading(false)
      return false
    }

    // Create new user with enhanced data structure
    const newUser = {
      id: Date.now().toString(),
      email,
      name,
      level: 1,
      coins: 100,
      xp: 0,
      badges: ["Welcome"],
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      preferences: {
        theme: "dark",
        notifications: true,
        soundEffects: true,
        autoSave: true,
      },
    }

    // Save user with password for authentication (in real app, this would be hashed)
    const userWithPassword = { ...newUser, password }
    const users_updated = [...users, userWithPassword]
    localStorage.setItem("codequest-users", JSON.stringify(users_updated))

    setUser(newUser)
    dataManager.saveUser(newUser)

    setIsLoading(false)
    return true
  }

  const logout = () => {
    setUser(null)
    dataManager.clearCurrentUser()
  }

  const updateUserProgress = (xp, coins, badges) => {
    if (!user) return

    const updatedUser = {
      ...user,
      xp: user.xp + xp,
      coins: user.coins + coins,
      level: Math.floor((user.xp + xp) / 1000) + 1,
      badges: badges ? [...user.badges, ...badges] : user.badges,
    }

    setUser(updatedUser)
    dataManager.saveUser(updatedUser)

    // Update in users array for authentication
    const users = dataManager.getUsers()
    const userIndex = users.findIndex((u) => u.id === user.id)
    if (userIndex !== -1) {
      const userWithPassword = users.find((u) => u.id === user.id)
      if (userWithPassword) {
        const updatedUserWithPassword = { ...updatedUser, password: userWithPassword.password }
        users[userIndex] = updatedUserWithPassword
        localStorage.setItem("codequest-users", JSON.stringify(users))
      }
    }
  }

  const updateUserPreferences = (preferences) => {
    if (!user) return

    const updatedUser = {
      ...user,
      preferences: { ...user.preferences, ...preferences },
    }

    setUser(updatedUser)
    dataManager.saveUser(updatedUser)
  }

  return {
    user,
    login,
    signup,
    logout,
    updateUserProgress,
    updateUserPreferences,
    isLoading,
  }
}

export { AuthContext }
