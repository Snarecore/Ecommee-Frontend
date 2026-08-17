'use client';

import SubscriptionPage from "@/views/vendor/subcription";
import RoleProtectedRoute from "@/providers/RoleProtectedRoute";
import { Role } from "@/enum/role.enum";

export default function VendorSubscriptionsPage() {
  return (
    <RoleProtectedRoute allowedRoles={[Role.VENDOR]}>
      <SubscriptionPage />
    </RoleProtectedRoute>
  );
}
