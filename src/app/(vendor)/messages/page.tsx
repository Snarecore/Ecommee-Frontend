'use client';

import Message from "@/views/vendor/content-cms/messages";
import RoleProtectedRoute from "@/providers/RoleProtectedRoute";
import { Role } from "@/enum/role.enum";

export default function VendorMessagesPage() {
  return (
    <RoleProtectedRoute allowedRoles={[Role.VENDOR]}>
      <Message />
    </RoleProtectedRoute>
  );
}
