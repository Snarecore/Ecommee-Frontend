'use client';

import VendorInvoiceView from "@/views/vendor/vendor-subscription-invoice";
import RoleProtectedRoute from "@/providers/RoleProtectedRoute";
import { Role } from "@/enum/role.enum";

export default function VendorSubscriptionInvoicePage() {
  return (
    <RoleProtectedRoute allowedRoles={[Role.VENDOR]}>
      <VendorInvoiceView />
    </RoleProtectedRoute>
  );
}
