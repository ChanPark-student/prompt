"use client"

import { useState, useEffect } from "react"
import { useAuth, API_URL, UserProfile } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminPromotePage() {
  const { user, token } = useAuth()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchUsers = async () => {
      if (user?.is_admin && token) {
        try {
          const response = await fetch(`${API_URL}/users`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          if (!response.ok) {
            throw new Error("Failed to fetch users")
          }
          const data = await response.json()
          setUsers(data)
        } catch (err: any) {
          setError(err.message)
        }
      }
    }
    fetchUsers()
  }, [user, token])

  const handlePromote = async (username: string) => {
    setError("")
    setMessage("")

    if (!token) {
      setError("You must be logged in to promote a user.")
      return
    }

    try {
      const response = await fetch(`${API_URL}/users/promote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to promote user")
      }

      const updatedUser = await response.json()
      setMessage(`User "${updatedUser.username}" has been promoted to admin.`)
      // Refresh the user list
      setUsers(users.map(u => u.username === updatedUser.username ? { ...u, is_admin: true } : u))
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleDemote = async (username: string) => {
    setError("")
    setMessage("")

    if (!token) {
      setError("You must be logged in to demote a user.")
      return
    }

    try {
      const response = await fetch(`${API_URL}/users/demote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to demote user")
      }

      const updatedUser = await response.json()
      setMessage(`User "${updatedUser.username}" has been demoted.`)
      // Refresh the user list
      setUsers(users.map(u => u.username === updatedUser.username ? { ...u, is_admin: false } : u))
    } catch (err: any) {
      setError(err.message)
    }
  }

  if (!user?.is_admin) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>You do not have permission to view this page.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Manage User Roles</CardTitle>
        </CardHeader>
        <CardContent>
          {message && <p className="mb-4 text-green-600">{message}</p>}
          {error && <p className="mb-4 text-red-600">{error}</p>}
          <div className="space-y-4">
            {users.map((u) => (
              <div key={u.id} className="flex items-center justify-between p-2 border rounded">
                <div>
                  <p className="font-semibold">{u.username}</p>
                  <p className="text-sm text-gray-500">{u.email}</p>
                </div>
                <div>
                  {u.is_admin ? (
                    <Button variant="destructive" size="sm" onClick={() => handleDemote(u.username)} disabled={user?.id === u.id}>
                      Demote
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => handlePromote(u.username)}>
                      Promote to Admin
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
