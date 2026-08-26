import Success from "@/views/success";
import RoleProtectedRoute from "@/providers/RoleProtectedRoute";
import { Role } from "@/enum/role.enum";

export default function SuccessPage() {
  return (
    <RoleProtectedRoute allowedRoles={[Role.CUSTOMER]}>
      <Success />
    </RoleProtectedRoute>
  );
}
