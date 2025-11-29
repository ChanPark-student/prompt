"use client"

import React, { useState, useEffect } from 'react'
import Link from "next/link"
import { useRouter } from "next/navigation" 
import Header from "@/components/header"
import Footer from "@/components/footer"
import AuthModal from "@/components/auth-modal"
import { useAuth, API_URL } from "@/lib/auth-context"
import { Prompt } from "@/lib/mock-data"; // Keep for type, can be defined locally later

export default function PromptDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter() 
  const [authModal, setAuthModal] = useState<"login" | "signup" | null>(null)
  
  const { user, userProfile, loading: authLoading } = useAuth()
  const isAuthenticated = !!user && !user.isAnonymous

  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [loading, setLoading] = useState(true);

  const resolvedParams = React.use(params);

  useEffect(() => {
    const fetchPrompt = async () => {
      if (!resolvedParams.id) return;
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/prompts/${resolvedParams.id}`);
        if (!response.ok) {
          throw new Error("Prompt not found");
        }
        const data = await response.json();
        setPrompt(data);
      } catch (error) {
        console.error("Failed to fetch prompt", error);
        setPrompt(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPrompt();
  }, [resolvedParams.id]);


  // 2. 이 글의 작성자가 'user' 본인인지 확인합니다.
  const isAuthor = isAuthenticated && userProfile && prompt && prompt.author === userProfile.name;
  
  // 3. 'isAuthor'가 true이면, 'isBlurred'는 처음부터 false가 됩니다.
  const [isBlurred, setIsBlurred] = useState(!isAuthor)
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(null)

  useEffect(() => {
    // Update isBlurred when isAuthor changes (after prompt has been fetched)
    setIsBlurred(!isAuthor);
  }, [isAuthor]);

  if (loading || authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    )
  }
  
  if (!prompt) {
    return (
      <>
        <Header onLogin={() => setAuthModal("login")} onSignup={() => setAuthModal("signup")} />
        <div className="flex justify-center items-center min-h-screen">
          프롬프트를 찾을 수 없습니다.
        </div>
        <Footer />
      </>
    )
  }
  
  const schoolSearchPath = `/search?school=${encodeURIComponent(prompt.school)}`

  return (
    <>
      <Header
        onLogin={() => setAuthModal("login")}
        onSignup={() => setAuthModal("signup")}
      />

      <div className="flex min-h-screen bg-gray-50">
        <aside className="hidden md:block w-64 bg-white border-r border-gray-200 p-6">
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-2 mb-8 text-gray-700 hover:text-gray-900"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            뒤로가기
          </button>
          
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
                            <h1 className="text-3xl font-bold mb-4">{prompt.title}</h1>
                            <p className="text-gray-600 mb-2">작성자: {prompt.author} | {prompt.date}</p>
                            <p className="text-gray-600">
                              {prompt.school} {">"} {prompt.subject} | 조회수 {prompt.views || 0} | 추천수 {(prompt.likes || 0) - (prompt.dislikes || 0)}
                            </p>
                          </div>
            <div className="relative mb-6">
              <div 
                className={`p-6 bg-white rounded-lg border border-gray-200 min-h-[200px] transition-all duration-300 ${isBlurred ? 'blur-md' : 'blur-none'}`}
              >
                <p className="text-gray-800 whitespace-pre-wrap">{prompt.content}</p>
              </div>
              
              {/* 4. 'isAuthor'가 false이고 'isBlurred'가 true일 때만 블러 오버레이를 표시합니다. */}
              {!isAuthor && isBlurred && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm">
                  <p className="font-semibold text-lg text-gray-700 mb-4">프롬프트 내용을 확인하세요</p>
                  <button
                    onClick={() => {
                      setIsBlurred(false)
                      setShowFeedback(true)
                    }}
                    className="px-6 py-3 bg-[#9DB78C] text-white rounded-full font-medium hover:bg-[#8AA876]"
                  >
                    프롬프트 보기
                  </button>
                </div>
              )}
            </div>

            {/* 5. 'isAuthor'가 false이고 'showFeedback'이 true일 때만 '좋아요/싫어요' 버튼을 표시합니다. */}
            {!isAuthor && showFeedback && (
              <div className="flex justify-center items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
                <p className="font-medium text-gray-700">이 프롬프트가 유용했나요?</p>
                <button 
                  onClick={() => setFeedback('like')}
                  disabled={feedback === 'like'}
                  className={`flex items-center gap-1 ${feedback === 'like' ? 'text-blue-500 font-bold' : 'text-gray-600 hover:text-blue-500'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21H7.42a2 2 0 01-1.965-2.22L6 11.83V5c0-1.1.9-2 2-2h4a2 2 0 012 2v5z" />
                  </svg>
                  좋아요
                </button>
                <button 
                  onClick={() => setFeedback('dislike')}
                  disabled={feedback === 'dislike'}
                  className={`flex items-center gap-1 ${feedback === 'dislike' ? 'text-red-500 font-bold' : 'text-gray-600 hover:text-red-500'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.737 3h7.84a2 2 0 011.965 2.22L18 12.17V19c0 1.1-.9 2-2 2h-4a2 2 0 01-2-2v-5z" />
                  </svg>
                  싫어요
                </button>
              </div>
            )}

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