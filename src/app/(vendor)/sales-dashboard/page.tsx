'use client';

import SalesDashboard from "@/views/vendor/sales-dashboard";
import RoleProtectedRoute from "@/providers/RoleProtectedRoute";
import { Role } from "@/enum/role.enum";

export default function SalesDashboardPage() {
  return (
    <RoleProtectedRoute allowedRoles={[Role.VENDOR]}>
      <SalesDashboard />
    </RoleProtectedRoute>
  );
}
