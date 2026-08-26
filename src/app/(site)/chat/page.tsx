import Chat from "@/views/chat";
import RoleProtectedRoute from "@/providers/RoleProtectedRoute";
import { Role } from "@/enum/role.enum";

export default function CustomerChatPage() {
  return (
    <RoleProtectedRoute allowedRoles={[Role.CUSTOMER]}>
      <Chat />
    </RoleProtectedRoute>
  );
}
