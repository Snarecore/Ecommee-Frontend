'use client';

import ProductDetails from "@/views/vendor/inventory/products/components/ProductDetails";
import RoleProtectedRoute from "@/providers/RoleProtectedRoute";
import { Role } from "@/enum/role.enum";

export default function VendorProductDetailsPage() {
  return (
    <RoleProtectedRoute allowedRoles={[Role.VENDOR]}>
      <ProductDetails />
    </RoleProtectedRoute>
  );
}
