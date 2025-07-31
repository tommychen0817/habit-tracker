"use client"

import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google"
import { loginWithGoogle } from "@/lib/api"

export function GoogleLoginButton({ onLogin }: { onLogin: () => void }) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <GoogleLogin
        onSuccess={async (credentialResponse) => {
          if (!credentialResponse.credential) return
          try {
            const data = await loginWithGoogle(credentialResponse.credential)
            localStorage.setItem("token", data.access_token)
            onLogin()
          } catch (e) {
            console.error("Login failed", e)
          }
        }}
        onError={() => console.error("Login Failed")}
      />
    </GoogleOAuthProvider>
  )
}
