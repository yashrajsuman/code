"use client"

import { RouteGuard } from "./route-guard"

export function ProtectedRoute({ children, redirectTo = "/login" }) {
  return (
    <RouteGuard requireAuth={true} redirectTo={redirectTo}>
      {children}
    </RouteGuard>
  )
}
