'use client';

import Dashboard from "@/views/vendor/dashboard";
import RoleProtectedRoute from "@/providers/RoleProtectedRoute";
import { Role } from "@/enum/role.enum";

export default function VendorDashboardPage() {
  return (
    <RoleProtectedRoute allowedRoles={[Role.VENDOR]}>
      <Dashboard />
    </RoleProtectedRoute>
  );
}
