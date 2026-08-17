'use client';

import Products from "@/views/vendor/inventory/products";
import RoleProtectedRoute from "@/providers/RoleProtectedRoute";
import { Role } from "@/enum/role.enum";

export default function ProductsPage() {
  return (
    <RoleProtectedRoute allowedRoles={[Role.VENDOR]}>
      <Products />
    </RoleProtectedRoute>
  );
}
