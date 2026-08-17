'use client';

import VendorChangePassword from "@/views/vendor/vendor-change-password";
import RoleProtectedRoute from "@/providers/RoleProtectedRoute";
import { Role } from "@/enum/role.enum";

export default function VendorChangePasswordPage() {
  return (
    <RoleProtectedRoute allowedRoles={[Role.VENDOR]}>
      <VendorChangePassword />
    </RoleProtectedRoute>
  );
}
