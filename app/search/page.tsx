"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link" // 1. Link를 import합니다.
import Header from "@/components/header"
import Footer from "@/components/footer"
import AuthModal from "@/components/auth-modal"
import { useAuth } from "@/lib/auth-context"
import { Category, subjects } from "@/lib/subjects"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const school = searchParams.get("school")
  const { loading } = useAuth()

  const [authModal, setAuthModal] = useState<"login" | "signup" | null>(null)
  const [selectedSchool, setSelectedSchool] = useState(school || "")
  
  // 2. 'step' 상태 로직을 완전히 제거했습니다.


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
              {subjects.map((subject) => (
                <Link
                  key={subject.id}
                  href={`/prompts/${subject.id}?school=${encodeURIComponent(selectedSchool)}`}
                  className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition text-center"
                >
                  <h3 className="font-semibold text-lg">{subject.name}</h3>
                  <p className="text-sm text-gray-600 mt-2">바로가기</p>
                </Link>
              ))}
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