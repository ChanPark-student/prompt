"use client"

import { useState } from "react"
import Link from "next/link"
import Header from "@/components/header"
import Footer from "@/components/footer"
import AuthModal from "@/components/auth-modal"
import Sidebar from "@/components/sidebar"
import { useAuth } from "@/lib/auth-context"
import { mockPrompts, Prompt } from "@/lib/mock-data" 

export default function MyPage() {
  const [authModal, setAuthModal] = useState<"login" | "signup" | null>(null)
  const { user, userProfile, loading } = useAuth()
  const isAuthenticated = !!user && !user.isAnonymous

  let totalLikes = 0; // ★★★ 1. 총 추천수 합계를 저장할 변수 ★★★
  const userPrompts: Prompt[] = []

  if (isAuthenticated && userProfile) {
    for (const key in mockPrompts) {
      const userUploads = mockPrompts[key].filter(
        prompt => prompt.author === userProfile.name
      );
      userPrompts.push(...userUploads);
    }
    
    // ★★★ 2. userPrompts의 총 추천수(likes - dislikes)를 계산합니다. ★★★
    totalLikes = userPrompts.reduce((sum, prompt) => sum + (prompt.likes - prompt.dislikes), 0);
  }

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
        <Sidebar
          onLogin={() => setAuthModal("login")}
          onSignup={() => setAuthModal("signup")}
        />

        <main className="flex-1 px-4 md:px-8 py-8">
          {isAuthenticated ? ( 
            <div>
              <div className="bg-gradient-to-r from-[#9DB78C] to-[#8AA876] rounded-lg p-8 mb-8 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white mb-0.5">{userProfile?.name}</h1>
                    <p className="text-white/80">{userProfile?.school}</p>
                    <p className="text-sm text-white/70">{userProfile?.studentId}학번 ({userProfile?.gender} | {userProfile?.age}세)</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg">
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                    {/* ★★★ 3. 고정된 '5' 대신 'totalLikes'를 표시합니다. ★★★ */}
                    <span className="font-semibold text-gray-800">{totalLikes}</span>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4">통계</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-6 rounded-lg">
                    <div className="text-3xl font-bold text-[#9DB78C]">{userPrompts.length}</div>
                    <p className="text-gray-600">업로드</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg">
                    {/* ★★★ 4. 평점 대신 '총 추천수'를 표시합니다. ★★★ */}
                    <div className="text-3xl font-bold text-[#9DB78C]">{totalLikes}</div>
                    <p className="text-gray-600">총 추천수</p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold mb-4">내 업로드</h2>
                <div className="space-y-4">
                  {userPrompts.length > 0 ? (
                    userPrompts.map((prompt) => (
                      <Link 
                        key={prompt.id} 
                        href={`/prompt-detail/${prompt.id}`} 
                        className="block"
                      >
                        <div className="bg-white p-6 rounded-lg hover:shadow-md transition">
                          <h3 className="font-bold text-lg mb-2">{prompt.title}</h3>
                          <p className="text-sm text-gray-600 mb-4">{prompt.school} {">"} {prompt.subject}</p>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">{prompt.date}</span>
                            <div className="flex gap-6 text-sm text-gray-600">
                              <span>조회수 {prompt.views}</span>
                              <span>추천수 {prompt.likes - prompt.dislikes}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      아직 업로드한 프롬프트가 없습니다.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-6">로그인 후 MY PAGE를 이용할 수 있습니다.</p>
            </div>
          )}
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