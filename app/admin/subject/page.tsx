"use client"

import { useState } from "react"
import { useAuth, API_URL } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminSubjectPage() {
  const { user, token } = useAuth()
  const [subjectName, setSubjectName] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setMessage("")

    if (!token) {
      setError("You must be logged in to add a subject.")
      return
    }

    try {
      const response = await fetch(`${API_URL}/subjects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: subjectName }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to add subject")
      }

      const newSubject = await response.json()
      setMessage(`Subject "${newSubject.name}" has been added successfully!`)
      setSubjectName("")
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
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>Add a New Subject</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              placeholder="Enter subject name"
              required
            />
            <Button type="submit">Add Subject</Button>
          </form>
          {message && <p className="mt-4 text-green-600">{message}</p>}
          {error && <p className="mt-4 text-red-600">{error}</p>}
        </CardContent>
      </Card>
    </div>
  )
}
