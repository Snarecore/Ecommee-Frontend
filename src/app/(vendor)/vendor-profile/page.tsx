'use client';

import VendorProfile from "@/views/vendor/vendor-profile";
import RoleProtectedRoute from "@/providers/RoleProtectedRoute";
import { Role } from "@/enum/role.enum";

export default function VendorProfilePage() {
  return (
    <RoleProtectedRoute allowedRoles={[Role.VENDOR]}>
      <VendorProfile />
    </RoleProtectedRoute>
  );
}
