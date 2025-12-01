"use client"

import React, { useState, useEffect } from 'react'
import Link from "next/link"
import Header from "@/components/header"
import Footer from "@/components/footer"
import AuthModal from "@/components/auth-modal"
import { useAuth, API_URL } from "@/lib/auth-context"
import { useSearchParams } from "next/navigation";

// Define a local, correct Prompt interface
interface Prompt {
  id: number;
  title: string;
  author: string;
  content: string;
  created_at: string;
  views: number;
  likes: number;
  dislikes: number;
  subject: string;
}

export default function PromptsPage({ params }: { params: { id: string } }) {
    const searchParams = useSearchParams();
    const schoolName = searchParams.get("school") || "알 수 없는 학교";

    const [authModal, setAuthModal] = useState<"login" | "signup" | null>(null)
    const { user, loading } = useAuth()
    const isAuthenticated = !!user
  
    const [prompts, setPrompts] = useState<Prompt[]>([]);
    const [loadingPrompts, setLoadingPrompts] = useState(true);
    const [subjectName, setSubjectName] = useState("과목 로딩 중...");
  
    const [sortBy, setSortBy] = useState<"latest" | "views" | "rating">("latest")
  
    const resolvedParams = React.use(params); // Correctly unwrap params
  
    useEffect(() => {
      const fetchSubjectDetails = async () => {
        try {
          const response = await fetch(`${API_URL}/subjects/${resolvedParams.id}`);
          if (!response.ok) {
            throw new Error("Failed to fetch subject details.");
          }
          const data = await response.json();
          setSubjectName(data.name);
        } catch (error) {
          console.error("Error fetching subject details:", error);
          setSubjectName("알 수 없는 과목");
        }
      };
      
      const fetchPromptsBySubject = async () => {
        setLoadingPrompts(true);
        try {
          const response = await fetch(`${API_URL}/prompts?subject_id=${resolvedParams.id}`);
          if (!response.ok) {
            throw new Error("Failed to fetch prompts.");
          }
          const data: Prompt[] = await response.json();
          setPrompts(data);
        } catch (error) {
          console.error("Error fetching prompts by subject:", error);
          setPrompts([]);
        } finally {
          setLoadingPrompts(false);
        }
      };
  
      if (resolvedParams.id) { // Use resolvedParams.id
        fetchSubjectDetails();
        fetchPromptsBySubject();
      }
    }, [resolvedParams.id]); // Use resolvedParams.id as dependency
  
    const schoolSearchPath = `/search?school=${encodeURIComponent(schoolName)}`
  
    const sortedPrompts = [...prompts].sort((a, b) => {
      if (sortBy === "rating") {
        return ((b.likes || 0) - (b.dislikes || 0)) - ((a.likes || 0) - (a.dislikes || 0))
      }
      if (sortBy === "views") {
        return (b.views || 0) - (a.views || 0)
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  
    if (loading || loadingPrompts) {
      return (      <div className="flex justify-center items-center min-h-screen">
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
            <span className="font-bold">{isAuthenticated ? user?.name : "Guest"}</span>
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
                    const isMyPost = isAuthenticated && user && prompt.author === user.name;
                    
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
                            <div className="text-xs text-gray-500">{new Date(prompt.created_at).toLocaleDateString()}</div>
                          </div>
                          <div className="flex gap-4 text-sm text-gray-600 items-center">
                            <span>조회수 {prompt.views || 0}</span>
                            <span>추천수 {(prompt.likes || 0) - (prompt.dislikes || 0)}</span>
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