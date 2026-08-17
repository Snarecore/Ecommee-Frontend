'use client';

import Chat from "@/views/vendor/chat";
import RoleProtectedRoute from "@/providers/RoleProtectedRoute";
import { Role } from "@/enum/role.enum";

export default function VendorChatPage() {
  return (
    <RoleProtectedRoute allowedRoles={[Role.VENDOR]}>
      <Chat />
    </RoleProtectedRoute>
  );
}
