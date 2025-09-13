"use client"

import { AuthContext, useAuthLogic } from "@/hooks/use-auth"

export function AuthProvider({ children }) {
  const auth = useAuthLogic()

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}
