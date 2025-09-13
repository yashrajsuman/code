"use client"

import { RouteGuard } from "./route-guard"

export function PublicRoute({ children }) {
  return <RouteGuard requireAuth={false}>{children}</RouteGuard>
}
