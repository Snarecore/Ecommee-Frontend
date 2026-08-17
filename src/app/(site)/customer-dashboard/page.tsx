'use client';

import UserProfile from "@/views/user-profile";
import RoleProtectedRoute from "@/providers/RoleProtectedRoute";
import { Role } from "@/enum/role.enum";

export default function CustomerDashboardPage() {
  return (
    <RoleProtectedRoute allowedRoles={[Role.CUSTOMER]}>
      <UserProfile />
    </RoleProtectedRoute>
  );
}
