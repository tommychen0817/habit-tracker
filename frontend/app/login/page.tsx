"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { GoogleLoginButton } from "../../components/auth/google-login-button"

export default function LoginPage() {
  const router = useRouter()

  useEffect(() => {
    if (localStorage.getItem("token")) {
      router.replace("/")
    }
  }, [router])

  return (
    <main className="min-h-screen p-4 md:p-8 bg-background">
      <div className="flex justify-center pt-20">
        <GoogleLoginButton onLogin={() => router.replace("/")} />
      </div>
    </main>
  )
}