"use client"

// ★★★ 1. 'useRef', 'useEffect'를 import합니다. ★★★
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"
import AuthModal from "@/components/auth-modal"
import { useAuth } from "@/lib/auth-context"

// ★★★ 2. 검색을 위한 학교 목록 (간단한 버전) ★★★
// (나중에는 이 목록을 DB나 API에서 가져와야 합니다)
const allSchools = [
  "전남대학교",
  "전북대학교",
  "서울대학교",
  "서강대학교",
  "서울여자대학교",
  "고려대학교",
  "연세대학교",
  "한양대학교",
  "성균관대학교",
  "중앙대학교",
]

export default function Home() {
  const router = useRouter()
  const { user } = useAuth()
  const [authModal, setAuthModal] = useState<"login" | "signup" | null>(null)
  const isAuthenticated = !!user && !user.isAnonymous

  // ★★★ 3. 자동완성을 위한 새 State들 ★★★
  const [searchTerm, setSearchTerm] = useState("") // 현재 입력창의 텍스트
  const [suggestions, setSuggestions] = useState<string[]>([]) // 필터링된 추천 목록
  const [showSuggestions, setShowSuggestions] = useState(false) // 목록을 보여줄지 여부

  // ★★★ 4. 검색창 밖을 클릭했는지 감지하기 위한 Ref ★★★
  const searchWrapperRef = useRef<HTMLDivElement>(null)

  // ★★★ 5. 검색창 밖을 클릭하면 추천 목록을 닫는 로직 ★★★
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [searchWrapperRef])

  // ★★★ 6. 검색어(state)를 기반으로 실제 검색을 실행하는 함수 ★★★
  // (기존 handleSearch를 이름 변경하고, searchTerm을 사용하도록 수정)
  const handleSearchSubmit = (school: string) => {
    if (!isAuthenticated) {
      setAuthModal("login")
      return
    }
    if (school.trim()) {
      // 검색 실행 시, 추천 목록을 닫고 검색어를 확정
      setSearchTerm(school)
      setShowSuggestions(false)
      router.push(`/search?school=${school}`)
    }
  }

  // ★★★ 7. 입력창의 내용이 바뀔 때마다 실행되는 함수 ★★★
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    if (value.length > 0) {
      const filtered = allSchools.filter(school =>
        school.toLowerCase().includes(value.toLowerCase())
      )
      setSuggestions(filtered)
      setShowSuggestions(true)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  // ★★★ 8. 추천 목록의 항목을 클릭했을 때 실행되는 함수 ★★★
  const handleSuggestionClick = (school: string) => {
    handleSearchSubmit(school)
  }

  return (
    <>
      <Header
        onLogin={() => setAuthModal("login")}
        onSignup={() => setAuthModal("signup")}
      />

      <main className="min-h-screen bg-gradient-to-b from-[#9DB78C] via-[#9DB78C] to-white">
        <div className="max-w-6xl mx-auto px-4 py-24 text-center">
          <h1 className="text-5xl font-bold text-white mb-6 text-pretty">지금 다니는 학교는 어디인가요?</h1>
          <p className="text-lg text-white/90 mb-24">검색하면 같은 학교 학생들의 학습 자료를 볼 수 있어요.</p>

          {/* ★★★ 9. 검색창과 추천 목록을 div로 감싸고 ref 연결 ★★★ */}
          <div 
            ref={searchWrapperRef} 
            className="relative max-w-2xl mx-auto mb-16"
          >
            <input
              type="text"
              placeholder="학교 검색하기"
              className="w-full px-6 pr-14 py-4 rounded-full text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#9DB78C] shadow-lg bg-white/80"
              value={searchTerm} // 10. value를 searchTerm state와 연결
              onChange={handleInputChange} // 11. onChange 이벤트 핸들러 연결
              onFocus={handleInputChange} // 12. 다시 포커스했을 때도 목록이 뜨도록
              onKeyPress={(e) => { // 13. Enter 키 눌렀을 때
                if (e.key === "Enter") {
                  handleSearchSubmit(searchTerm)
                }
              }}
            />
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => { // 14. 검색 버튼 눌렀을 때
                handleSearchSubmit(searchTerm)
              }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>

            {/* ★★★ 15. 자동완성 추천 목록 ★★★ */}
            {showSuggestions && suggestions.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1 shadow-lg max-h-60 overflow-y-auto text-left">
                {suggestions.map((school) => (
                  <li
                    key={school}
                    className="px-6 py-3 text-gray-700 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleSuggestionClick(school)}
                  >
                    {school}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex justify-center">
            <svg className="w-8 h-8 text-white animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </main>
      
      {/* ... (이하 나머지 코드는 동일) ... */}
      <section className="bg-white py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-gray-50 rounded-lg shadow-sm">
              <div className="text-3xl font-bold text-[#9DB78C] mb-2">수천개</div>
              <p className="text-gray-600">학습 자료가 있어요</p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-lg shadow-sm">
              <div className="text-3xl font-bold text-[#9DB78C] mb-2">무료로</div>
              <p className="text-gray-600">모든 자료를 볼 수 있어요</p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-lg shadow-sm">
              <div className="text-3xl font-bold text-[#9DB78C] mb-2">쉽게</div>
              <p className="text-gray-600">공유하고 받을 수 있어요</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {authModal && (
        <AuthModal
          mode={authModal}
          onClose={() => setAuthModal(null)}
        />
      )}
    </>
  )
}