"use client"

import React, { useState } from 'react'
import { useAuth, UserProfile } from '@/lib/auth-context' // Import auth hook and profile type

interface AuthModalProps {
  mode: 'login' | 'signup'
  onClose: () => void
  // 'onSuccess' prop is no longer needed, as the auth context handles this
}

type ProfileData = Omit<UserProfile, 'email'>

export default function AuthModal({ mode, onClose }: AuthModalProps) {
  const [currentMode, setCurrentMode] = useState(mode)
  const [step, setStep] = useState(1) // For multi-step signup
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // State for Step 2 profile data
  const [profile, setProfile] = useState<ProfileData>({
    name: '',
    gender: '',
    age: '',
    school: '',
    student_id: '',
  })

  const { login, signupAndCreateProfile } = useAuth()

  const handleProfileChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setProfile((prev) => ({ ...prev, [name]: value }))
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email, password)
      onClose() // Close modal on success
    } catch (err) {
      // Firebase 에러 메시지를 사용자 친화적으로 변경
      let message = (err as Error).message
      if (message.includes('auth/invalid-credential')) {
        message = '이메일 또는 비밀번호가 일치하지 않습니다.'
      } else if (message.includes('auth/user-not-found')) {
        message = '존재하지 않는 사용자입니다.'
      }
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleSignupStep1 = (e: React.FormEvent) => {
    e.preventDefault()
    // Basic validation
    if (!email || !password) {
      setError('이메일과 비밀번호를 모두 입력해 주세요.')
      return
    }
    if (password.length < 6) {
      setError('비밀번호는 6자리 이상이어야 합니다.')
      return
    }
    setError(null)
    setStep(2) // Move to step 2
  }

  const handleSignupStep2 = async (e: React.FormEvent) => {
    e.preventDefault()
    // Check if all fields are filled
    const allFieldsFilled = Object.values(profile).every(field => field.trim() !== '');
    if (!allFieldsFilled) {
      setError('모든 프로필 정보를 입력해 주세요.');
      return;
    }

    setError(null)
    setLoading(true)
    try {
      // Call the new function from context
      await signupAndCreateProfile(email, password, profile)
      onClose() // Close modal on success (auto-login)
    } catch (err) {
      let message = (err as Error).message
      if (message.includes('auth/email-already-in-use')) {
        message = '이미 사용 중인 이메일입니다.'
        setStep(1); // Go back to step 1
      }
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  // 모달 뒷배경 클릭 시 닫기 (로딩 중 아닐 때)
  const handleBackdropClick = () => {
    if (!loading) {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={handleBackdropClick}>
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-center mb-6">
          {currentMode === 'login'
            ? '로그인'
            : '회원가입'}
        </h2>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {/* --- LOGIN FORM / SIGNUP STEP 1 --- */}
        {step === 1 && (
          <form onSubmit={currentMode === 'login' ? handleLogin : handleSignupStep1}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#9DB78C] text-white py-2 rounded-md hover:bg-[#8AA876] disabled:opacity-50"
            >
              {loading
                ? '처리 중...'
                : currentMode === 'login'
                ? '로그인'
                : '다음'}
            </button>
          </form>
        )}

        {/* --- SIGNUP STEP 2 (PROFILE) --- */}
        {currentMode === 'signup' && step === 2 && (
          <form onSubmit={handleSignupStep2}>
            <p className="text-sm text-gray-600 mb-4">마지막 단계입니다. 프로필을 완성해 주세요.</p>
            
            {/* Input fields for profile data */}
            <div className="grid grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
                <input type="text" name="name" value={profile.name} onChange={handleProfileChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">성별</label>
                <select name="gender" value={profile.gender} onChange={handleProfileChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" required>
                  <option value="">선택</option>
                  <option value="male">남성</option>
                  <option value="female">여성</option>
                  <option value="other">기타</option>
                </select>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">나이</label>
              <input type="number" name="age" value={profile.age} onChange={handleProfileChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">학교</label>
              <input type="text" name="school" value={profile.school} onChange={handleProfileChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">학번</label>
              <input type="text" name="student_id" value={profile.student_id} onChange={handleProfileChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setStep(1)} // "이전" 버튼
                disabled={loading}
                className="w-1/2 bg-gray-200 text-gray-700 py-2 rounded-md hover:bg-gray-300"
              >
                이전
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-1/2 bg-[#9DB78C] text-white py-2 rounded-md hover:bg-[#8AA876] disabled:opacity-50"
              >
                {loading ? '가입 중...' : '회원가입 완료'}
              </button>
            </div>
          </form>
        )}

        <div className="text-center mt-6">
          {currentMode === 'login' ? (
            <p className="text-sm text-gray-600">
              계정이 없으신가요?{' '}
              <button onClick={() => setCurrentMode('signup')} className="text-[#9DB78C] font-medium">
                회원가입
              </button>
            </p>
          ) : (
            <p className="text-sm text-gray-600">
              계정이 있으신가요?{' '}
              <button onClick={() => { setCurrentMode('login'); setStep(1); }} className="text-[#9DB78C] font-medium">
                로그인
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
