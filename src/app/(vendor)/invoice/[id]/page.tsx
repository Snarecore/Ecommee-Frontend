'use client';

import InvoiceView from "@/views/vendor/invoice-details/Invoice";
import RoleProtectedRoute from "@/providers/RoleProtectedRoute";
import { Role } from "@/enum/role.enum";

export default function VendorInvoiceDetailsPage() {
  return (
    <RoleProtectedRoute allowedRoles={[Role.VENDOR]}>
      <InvoiceView />
    </RoleProtectedRoute>
  );
}
