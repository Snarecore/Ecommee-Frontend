'use client';

import Wallet from "@/views/vendor/wallet";
import RoleProtectedRoute from "@/providers/RoleProtectedRoute";
import { Role } from "@/enum/role.enum";

export default function WalletPage() {
  return (
    <RoleProtectedRoute allowedRoles={[Role.VENDOR]}>
      <Wallet />
    </RoleProtectedRoute>
  );
}
