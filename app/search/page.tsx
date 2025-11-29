"use client"

import { useState, useEffect } from "react" // useEffect 추가
import { useSearchParams } from "next/navigation"
import Link from "next/link" // 1. Link를 import합니다.
import Header from "@/components/header"
import Footer from "@/components/footer"
import AuthModal from "@/components/auth-modal"
import { useAuth, API_URL } from "@/lib/auth-context" // API_URL 추가
// import { Category, subjects } from "@/lib/subjects" // subjects는 API에서 가져오므로 주석 처리 또는 제거

export default function SearchPage() {
  const searchParams = useSearchParams()
  const school = searchParams.get("school")
  const { loading } = useAuth()

  const [authModal, setAuthModal] = useState<"login" | "signup" | null>(null)
  const [selectedSchool, setSelectedSchool] = useState(school || "")
  
  // 2. 'step' 상태 로직을 완전히 제거했습니다.

  // ★★★ API에서 과목 목록을 가져오기 위한 새 State들 ★★★
  const [subjectsData, setSubjectsData] = useState<Array<{ id: number; name: string }>>([])
  const [loadingSubjects, setLoadingSubjects] = useState(true)

  // 과목 목록을 API에서 가져오는 useEffect
  useEffect(() => {
    async function fetchSubjects() {
      try {
        const response = await fetch(`${API_URL}/subjects/`)
        if (!response.ok) {
          throw new Error("Failed to fetch subjects")
        }
        const data = await response.json()
        setSubjectsData(data)
      } catch (error) {
        console.error("Error fetching subjects:", error)
        // 에러 발생 시 처리 (예: 사용자에게 알림)
      } finally {
        setLoadingSubjects(false)
      }
    }
    fetchSubjects()
  }, [])


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
        <div className="max-w-4xl mx-auto px-4">
          {/* 3. 'step' 로직을 제거하고 '과목 선택' 페이지만 남겼습니다. */}
          <div>
            {/* ★★★ 4. <button>을 <Link>로 바꾸고, href="/"와 텍스트를 수정했습니다. ★★★ */}
            <Link href="/" className="text-[#9DB78C] mb-4 font-medium inline-flex items-center">
              ← HOME
            </Link>
            <h1 className="text-3xl font-bold mb-2">{selectedSchool}</h1>
            <p className="text-gray-600 mb-8">과목을 선택하세요</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {loadingSubjects ? (
                <p>과목을 불러오는 중...</p>
              ) : subjectsData.length === 0 ? (
                <p>과목이 없습니다.</p>
              ) : (
                subjectsData.map((subject) => (
                  <Link
                    key={subject.id}
                    href={`/prompts/${subject.id}?school=${encodeURIComponent(selectedSchool)}`}
                    className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition text-center"
                  >
                    <h3 className="font-semibold text-lg">{subject.name}</h3>
                    <p className="text-sm text-gray-600 mt-2">바로가기</p>
                  </Link>
                ))
              )}
            </div>
          </div>
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