'use client';

import Orders from "@/views/vendor/orders";
import RoleProtectedRoute from "@/providers/RoleProtectedRoute";
import { Role } from "@/enum/role.enum";

export default function VendorOrdersPage() {
  return (
    <RoleProtectedRoute allowedRoles={[Role.VENDOR]}>
      <Orders />
    </RoleProtectedRoute>
  );
}
