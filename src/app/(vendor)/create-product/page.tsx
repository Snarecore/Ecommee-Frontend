'use client';

import CreateProduct from "@/views/vendor/create-product";
import RoleProtectedRoute from "@/providers/RoleProtectedRoute";
import { Role } from "@/enum/role.enum";

export default function CreateProductPage() {
  return (
    <RoleProtectedRoute allowedRoles={[Role.VENDOR]}>
      <CreateProduct />
    </RoleProtectedRoute>
  );
}
