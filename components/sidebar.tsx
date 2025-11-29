"use client"

import Link from "next/link"
import { useAuth } from "@/lib/auth-context" // 1. '전역 관리자' import

interface SidebarProps {
  // 2. 'isAuthenticated' prop 제거
  onLogin: () => void
  onSignup: () => void
}

export default function Sidebar({ onLogin, onSignup }: SidebarProps) {
  // 3. '전역 관리자'로부터 실제 로그인 정보 및 통계 가져오기
  const { user, totalPrompts, totalLikes } = useAuth()
  const isAuthenticated = !!user && !user.isAnonymous

  return (
    <aside className="hidden md:block w-64 bg-white border-r border-gray-200 py-8">
      <div className="px-6">
        {/* 4. 로그인 되었을 때만 프로필과 통계를 보여줌 */}
        {isAuthenticated && user && (
          <>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-[#9DB78C] rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
              {/* 5. 'user'에서 실제 사용자 이름 가져오기 */}
              <span className="font-bold">{user?.name}</span>
            </div>

            {/* 6. 요청하신 통계 수정 (동적 데이터로 변경) */}
            <div className="space-y-1 mb-8">
              <div className="flex justify-between text-sm text-gray-600">
                <span>업로드</span>
                <span>{totalPrompts}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>평점</span>
                <span>{totalLikes}</span>
              </div>
            </div>

            {/* ★★★ 'button'을 'Link'로 수정하고 href="/upload" 추가 ★★★ */}
            <Link
              href="/upload"
              className="block w-full py-2 bg-[#9DB78C] text-white text-center rounded-lg font-medium hover:bg-[#8AA876] mb-6"
            >
              + NEW
            </Link>
          </>
        )}

        <nav className="space-y-4">
          <Link href="/" className="flex items-center gap-2 text-gray-700 hover:text-gray-900">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9M9 5l3-3m0 0l3 3m-3-3v12"
              />
            </svg>
            HOME
          </Link>
          {/* 7. "MY PAGE" 링크 제거 */}
        </nav>

        {/* 8. 로그아웃 상태일 때만 로그인/회원가입 버튼 표시 */}
        {!isAuthenticated && (
          <div className="mt-8 space-y-2">
            <button
              onClick={onLogin}
              className="w-full py-2 text-[#9DB78C] border border-[#9DB78C] rounded-lg hover:bg-[#f5f5f5]"
            >
              로그인
            </button>
            <button onClick={onSignup} className="w-full py-2 bg-[#9DB78C] text-white rounded-lg hover:bg-[#8AA876]">
              회원가입
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}