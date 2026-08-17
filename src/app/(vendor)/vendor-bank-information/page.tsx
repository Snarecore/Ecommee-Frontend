'use client';

import VendorBankInformation from "@/views/vendor/vendor-bank-information";
import RoleProtectedRoute from "@/providers/RoleProtectedRoute";
import { Role } from "@/enum/role.enum";

export default function VendorBankInformationPage() {
  return (
    <RoleProtectedRoute allowedRoles={[Role.VENDOR]}>
      <VendorBankInformation />
    </RoleProtectedRoute>
  );
}
