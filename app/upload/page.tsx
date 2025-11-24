"use client"

import React, { useState } from "react" // 1. React import
import { useRouter } from "next/navigation" // ★★★ 1. useRouter import ★★★
import Header from "@/components/header"
import Footer from "@/components/footer"
import AuthModal from "@/components/auth-modal"
import { useAuth } from "@/lib/auth-context" // 2. '전역 관리자' import

export default function UploadPage() {
  const router = useRouter() // ★★★ 2. useRouter 훅 선언 ★★★
  const [authModal, setAuthModal] = useState<"login" | "signup" | null>(null)
  
  // 3. '전역 관리자'로부터 실제 로그인 정보 가져오기
  const { user, loading } = useAuth()
  
  // 4. 'useState(false)'를 삭제하고, 실제 user 정보로 로그인 상태 결정
  const isAuthenticated = !!user && !user.isAnonymous

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [showSuccess, setShowSuccess] = useState(false) // 5. 'alert' 대신 사용할 성공 메시지 상태

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: 여기에 실제 업로드 로직(예: API 호출)을 추가합니다.
    console.log("Uploading:", { title, content })

    // 6. 'alert' 대신 성공 메시지 표시
    setShowSuccess(true)
    setTitle("")
    setContent("")
    // 3초 후에 메시지 숨기기
    setTimeout(() => {
      setShowSuccess(false)
    }, 3000)
  }

  // 7. 로딩 중일 때 빈 화면 대신 로딩 표시
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    )
  }

  return (
    <>
      <Header
        onLogin={() => setAuthModal("login")}
        onSignup={() => setAuthModal("signup")}
      />

      <main className="min-h-screen bg-white py-12">
        <div className="max-w-2xl mx-auto px-4">
          
          {/* ★★★ 3. 뒤로가기 버튼 추가 ★★★ */}
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-6"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            뒤로가기
          </button>
          
          <h1 className="text-3xl font-bold mb-8">프롬프트 업로드</h1>

          {isAuthenticated ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 9. 업로드 성공 메시지 표시 */}
              {showSuccess && (
                <div className="p-3 bg-green-100 text-green-700 rounded-lg">
                  프롬프트가 업로드되었습니다!
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">제목</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="프롬프트 제목을 입력하세요"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9DB78C]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">내용</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="프롬프트 내용을 입력하세요"
                  rows={10}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9DB78C]"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#9DB78C] text-white rounded-lg font-medium hover:bg-[#8AA876]"
              >
                업로드
              </button>
            </form>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-6">로그인 후 프롬프트를 업로드할 수 있습니다.</p>
              <button
                onClick={() => setAuthModal("login")}
                className="px-6 py-2 bg-[#9DB78C] text-white rounded-lg font-medium hover:bg-[#8AA876]"
              >
                로그인
              </button>
            </div>
          )}
        </div>
      </main>

      {authModal && (
        <AuthModal
          mode={authModal}
          onClose={() => setAuthModal(null)}
        />
      )}

      <Footer />
    </>
  )
}
