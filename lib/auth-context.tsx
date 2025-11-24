"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// --- Mock Data & Types ---

// 1. User 객체 타입 (Firebase User 객체를 흉내)
interface MockUser {
  uid: string
  email: string
  isAnonymous: boolean
}

// 2. User 프로필 타입 (기존과 동일)
export interface UserProfile {
  name: string
  gender: string
  age: string
  school: string
  studentId: string
  email: string
}

// 3. '0'으로 로그인 시 사용할 고정된 프로필
const MOCK_PROFILE_FOR_ZERO: UserProfile = {
  name: "user", // "user에" 라고 하셔서 user로 설정합니다.
  gender: "남자",
  age: "20", // 나이는 임의로 설정했습니다.
  school: "전남대학교",
  studentId: "211931",
  email: "0" // (로그인 함수에서 '0@0'으로 덮어쓸 예정)
}

// 4. Context 타입 (기존과 동일)
interface AuthContextType {
  user: MockUser | null
  userProfile: UserProfile | null
  loading: boolean
  login: (email: string, pass: string) => Promise<void>
  signupAndCreateProfile: (
    email: string,
    pass: string,
    profileData: Omit<UserProfile, 'email'>
  ) => Promise<void>
  logout: () => Promise<void>
}

// --- Auth Context (Firebase 없음) ---
const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<MockUser | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // [로그인 유지] 앱이 처음 로드될 때 localStorage에서 로그인 정보 복원
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('mockUser')
      const storedProfile = localStorage.getItem('mockProfile')

      if (storedUser && storedProfile) {
        setUser(JSON.parse(storedUser))
        setUserProfile(JSON.parse(storedProfile))
      }
    } catch (error) {
      console.error("Failed to parse mock login data from localStorage", error)
      localStorage.clear()
    }
    setLoading(false)
  }, [])

  // --- 가짜(Mock) 인증 함수들 ---

  const login = async (email: string, pass: string) => {
    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 300)) // 가짜 로딩

    // 1. '0@0'으로 로그인 시도
    if (email === "0@0" && pass === "0") {
      // 2. 요청하신 고정 프로필을 사용
      const mockProfile = MOCK_PROFILE_FOR_ZERO

      // 3. '0@0' 이메일로 MockUser를 생성 (기존 '0' 대신)
      const mockUser: MockUser = {
        uid: "mock-user-000",
        email: email, // '0' 대신 로그인에 사용한 '0@0'을 저장
        isAnonymous: false,
      }
      
      // 4. 고정 프로필의 이메일도 '0@0'으로 통일
      const finalProfile = {
        ...mockProfile,
        email: email
      }

      // 5. State 및 localStorage에 저장
      setUser(mockUser)
      setUserProfile(finalProfile)
      localStorage.setItem('mockUser', JSON.stringify(mockUser))
      localStorage.setItem('mockProfile', JSON.stringify(finalProfile))

      setLoading(false)
    } else {
      // '0@0'이 아니면 실패
      setLoading(false)
      throw new Error("아이디 또는 비밀번호가 일치하지 않습니다.")
    }
  }

  const signupAndCreateProfile = async (
    email: string,
    pass: string,
    profileData: Omit<UserProfile, 'email'>
  ) => {
    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 300)) // 가짜 로딩

    // 1. 어떤 정보로든 회원가입 성공
    const mockUser: MockUser = {
      uid: `mock-user-${Math.random().toString(36).substring(2, 9)}`,
      email: email,
      isAnonymous: false,
    }
    // 2. 2단계에서 받은 프로필 정보를 사용
    const newProfile: UserProfile = {
      ...profileData,
      email: email,
    }

    // 3. State 및 localStorage에 저장
    setUser(mockUser)
    setUserProfile(newProfile)
    localStorage.setItem('mockUser', JSON.stringify(mockUser))
    localStorage.setItem('mockProfile', JSON.stringify(newProfile))

    setLoading(false)
  }

  const logout = async () => {
    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 100)) // 가짜 로딩
    
    // 1. State 및 localStorage에서 정보 제거
    setUser(null)
    setUserProfile(null)
    localStorage.removeItem('mockUser')
    localStorage.removeItem('mockProfile')

    setLoading(false)
  }

  const value = {
    user,
    userProfile,
    loading,
    login,
    signupAndCreateProfile,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// 5. useAuth hook (기존과 동일)
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}