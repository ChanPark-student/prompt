"use client"

import React, { useState } from 'react'
import Link from "next/link"
import Header from "@/components/header"
import Footer from "@/components/footer"
import AuthModal from "@/components/auth-modal"
import { useAuth } from "@/lib/auth-context"
import { mockPrompts, Prompt } from "@/lib/mock-data" 

export default function PromptsPage({ params }: { params: { id: string } }) {
  const [authModal, setAuthModal] = useState<"login" | "signup" | null>(null)
  const { user, userProfile, loading } = useAuth()
  const isAuthenticated = !!user && !user.isAnonymous

  const [sortBy, setSortBy] = useState<"latest" | "views" | "rating">("latest")
  const [currentPage, setCurrentPage] = useState(1)

  const resolvedParams = React.use(params)
  const prompts = mockPrompts[resolvedParams.id] || []

  const schoolName = prompts.length > 0 
    ? prompts[0].school 
    : "알 수 없는 학교"
  const subjectName = prompts.length > 0 
    ? prompts[0].subject 
    : (resolvedParams.id === "2" ? "경제성공학" : (resolvedParams.id === "3" ? "확률통계" : "알 수 없는 과목")) 
  
  const schoolSearchPath = `/search?school=${encodeURIComponent(schoolName)}`

  // ★★★ 1. '추천순' 정렬 로직을 (b.likes - b.dislikes)로 수정 ★★★
  const sortedPrompts = [...prompts].sort((a, b) => {
    if (sortBy === "rating") { // "추천순" (좋아요 - 싫어요)
      return (b.likes - b.dislikes) - (a.likes - a.dislikes)
    }
    if (sortBy === "views") { // "조회순"
      return b.views - a.views
    }
    // "latest" (최신순)
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })

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

      <div className="flex min-h-screen bg-gray-50">
        <aside className="hidden md:block w-64 bg-white border-r border-gray-200 p-6">
          <Link href={schoolSearchPath} className="flex items-center gap-2 mb-8 text-gray-700 hover:text-gray-900">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            뒤로가기
          </Link>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-[#9DB78C] rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
            <span className="font-bold">{isAuthenticated ? userProfile?.name : "Guest"}</span>
          </div>
          <nav className="space-y-4">
            <Link href="/" className="flex items-center gap-2 text-gray-700 hover:text-gray-900">
              HOME
            </Link>
            <Link href="/my-page" className="flex items-center gap-2 text-gray-700 hover:text-gray-900">
              MY PAGE
            </Link>
          </nav>
        </aside>

        <main className="flex-1 p-6 md:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">{schoolName} {">"} {subjectName}</h1>
              <p className="text-gray-600">이 대학의 과목을 검색하세요</p>
            </div>

            <div className="flex gap-4 mb-8">
              <input
                type="text"
                placeholder="이 대학의 과목을 검색하세요"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9DB78C]"
              />
              <button className="p-2 text-gray-600 hover:text-gray-900">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            </div>

            <div className="mb-8">
              <p className="text-gray-600 mb-4">목록</p>
              <div className="flex gap-4 mb-6">
                 <button
                  onClick={() => setSortBy("latest")}
                  className={`px-4 py-2 font-medium ${
                    sortBy === "latest" ? "text-[#9DB78C] border-b-2 border-[#9DB78C]" : "text-gray-600"
                  }`}
                >
                  최신순
                </button>
                <button
                  onClick={() => setSortBy("views")}
                  className={`px-4 py-2 font-medium ${
                    sortBy === "views" ? "text-[#9DB78C] border-b-2 border-[#9DB78C]" : "text-gray-600"
                  }`}
                >
                  조회순
                </button>
                <button
                  onClick={() => setSortBy("rating")}
                  className={`px-4 py-2 font-medium ${
                    sortBy === "rating" ? "text-[#9DB78C] border-b-2 border-[#9DB78C]" : "text-gray-600"
                  }`}
                >
                  추천순
                </button>
              </div>

              <div className="space-y-4">
                {sortedPrompts.length > 0 ? (
                  sortedPrompts.map((prompt, index) => {
                    const isMyPost = isAuthenticated && userProfile && prompt.author === userProfile.name;
                    
                    return (
                      <Link key={prompt.id} href={`/prompt-detail/${prompt.id}`} className="block">
                        <div className="flex gap-4 p-4 bg-white rounded-lg hover:shadow-md transition">
                          <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center font-bold text-gray-600">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-lg">{prompt.title}</h3>
                              {isMyPost && (
                                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                  MY
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{prompt.author}</p>
                            <div className="text-xs text-gray-500">{prompt.date}</div>
                          </div>
                          {/* ★★★ 2. '추천수'를 (prompt.likes - prompt.dislikes)로 수정 ★★★ */}
                          <div className="flex gap-4 text-sm text-gray-600 items-center">
                            <span>조회수 {prompt.views}</span>
                            <span>추천수 {prompt.likes - prompt.dislikes}</span>
                          </div>
                        </div>
                      </Link>
                    )
                  })
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    아직 업로드된 프롬프트가 없습니다.
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-center gap-2 mb-8">
              <button className="px-3 py-2 text-gray-600 hover:text-gray-900">‹</button>
              <button className="px-3 py-2 bg-[#9DB78C] text-white rounded">1</button>
              <button className="px-3 py-2 text-gray-600 hover:text-gray-900">2</button>
              <button className="px-3 py-2 text-gray-600 hover:text-gray-900">›</button>
              <button className="px-3 py-2 text-gray-600 hover:text-gray-900">»</button>
            </div>

            <Link href="/upload" className="fixed bottom-8 right-8 px-6 py-3 bg-[#9DB78C] text-white rounded-full font-medium hover:bg-[#8AA876]">
              + 업로드
            </Link>
          </div>
        </main>
      </div>

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