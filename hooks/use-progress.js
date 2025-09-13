"use client"

import { useState, useEffect } from "react"
import { dataManager } from "@/lib/data-manager"
import { useAuth } from "./use-auth"

export function useProgress() {
  const { user } = useAuth()
  const [progress, setProgress] = useState([])
  const [currentSession, setCurrentSession] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadProgress()
    }
  }, [user])

  const loadProgress = () => {
    if (!user) return

    setIsLoading(true)
    try {
      const userProgress = dataManager.getUserProgress(user.id)
      setProgress(userProgress)
    } catch (error) {
      console.error("Failed to load progress:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateTopicProgress = (subjectId, topicId, progressData) => {
    if (!user) return

    const existingProgress = dataManager.getTopicProgress(user.id, subjectId, topicId)

    const updatedProgress = {
      userId: user.id,
      subjectId,
      topicId,
      status: "in-progress",
      progress: 0,
      attempts: 0,
      bestScore: 0,
      timeSpent: 0,
      lastAccessedAt: new Date().toISOString(),
      ...existingProgress,
      ...progressData,
    }

    dataManager.saveUserProgress(updatedProgress)
    loadProgress()
  }

  const completeTopicProgress = (subjectId, topicId, score, xpEarned, coinsEarned) => {
    if (!user) return

    const existingProgress = dataManager.getTopicProgress(user.id, subjectId, topicId)

    const updatedProgress = {
      userId: user.id,
      subjectId,
      topicId,
      status: "completed",
      progress: 100,
      attempts: (existingProgress?.attempts || 0) + 1,
      bestScore: Math.max(existingProgress?.bestScore || 0, score),
      timeSpent: existingProgress?.timeSpent || 0,
      completedAt: new Date().toISOString(),
      lastAccessedAt: new Date().toISOString(),
    }

    dataManager.saveUserProgress(updatedProgress)

    // Complete current session if exists
    if (currentSession) {
      dataManager.completeLearningSession(currentSession.id, xpEarned, coinsEarned, score)
      setCurrentSession(null)
    }

    loadProgress()
  }

  const startLearningSession = (topicId) => {
    if (!user) throw new Error("User not authenticated")

    const session = dataManager.startLearningSession(user.id, topicId)
    setCurrentSession(session)
    return session
  }

  const getTopicProgress = (subjectId, topicId) => {
    return progress.find((p) => p.subjectId === subjectId && p.topicId === topicId) || null
  }

  const getSubjectProgress = (subjectId) => {
    const subjectProgress = progress.filter((p) => p.subjectId === subjectId)
    const completedTopics = subjectProgress.filter((p) => p.status === "completed").length
    const totalTopics = subjectProgress.length
    const overallProgress = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0

    return {
      completedTopics,
      totalTopics,
      progress: overallProgress,
      topics: subjectProgress,
    }
  }

  const getUserStatistics = () => {
    if (!user) return null
    return dataManager.getUserStatistics(user.id)
  }

  return {
    progress,
    currentSession,
    isLoading,
    updateTopicProgress,
    completeTopicProgress,
    startLearningSession,
    getTopicProgress,
    getSubjectProgress,
    getUserStatistics,
    loadProgress,
  }
}
