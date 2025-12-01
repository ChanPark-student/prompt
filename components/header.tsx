"use client"

import Link from "next/link"
import { useRouter } from "next/navigation" // 1. useRouter를 import 합니다.
import { useAuth } from "@/lib/auth-context" // 2. useAuth hook을 import 합니다.

// 3. 페이지로부터 'onLogin', 'onSignup' 함수를 props로 받습니다.
interface HeaderProps {
  onLogin: () => void
  onSignup: () => void
}

export default function Header({ onLogin, onSignup }: HeaderProps) {
  const { user, logout } = useAuth() // 4. 로그인 상태와 로그아웃 함수는 context에서 가져옵니다.
  const router = useRouter()

  // 5. 실제 로그인 여부를 확인합니다. (익명 사용자가 아닌 경우)
  const isAuthenticated = !!user && !user.isAnonymous

  // 6. 로그아웃 함수
  const handleLogout = async () => {
    await logout()
    router.push("/") // 로그아웃 후 홈으로 이동
  }

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="text-2xl font-bold">
            <span className="text-gray-900">promstudy</span>
          </div>
        </Link>

        <button className="md:hidden text-gray-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <nav className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              {user.is_admin ? (
                <>
                  <Link href="/admin/school" className="text-gray-600 hover:text-gray-900">
                    SCHOOL
                  </Link>
                  <Link href="/admin/subject" className="text-gray-600 hover:text-gray-900">
                    SUBJECT
                  </Link>
                  <Link href="/admin/promote" className="text-gray-600 hover:text-gray-900">
                    ADMIN
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/my-page" className="text-gray-600 hover:text-gray-900">
                    MY PAGE
                  </Link>
                  <Link href="/upload" className="text-gray-600 hover:text-gray-900">
                    UPLOAD
                  </Link>
                </>
              )}
              <button onClick={handleLogout} className="px-4 py-2 text-gray-600 hover:text-gray-900">
                LOGOUT
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onLogin} // 7. props로 받은 onLogin 함수를 사용합니다.
                className="px-3 py-1.5 text-sm rounded-full bg-[#9DB78C] text-white hover:bg-[#8AA876] font-medium"
              >
                로그인
              </button>
              <button
                onClick={onSignup} // 8. props로 받은 onSignup 함수를 사용합니다.
                className="px-3 py-1.5 text-sm rounded-full bg-[#9DB78C] text-white hover:bg-[#8AA876] font-medium"
              >
                회원가입
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}