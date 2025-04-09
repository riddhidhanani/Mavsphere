import UserSphere from "@/components/user-sphere-page";
import LayoutComponent from "@/components/layout-component";
import ProtectedRoute from "@/components/protected-route";

export default function Page() {
  return (
    <ProtectedRoute>
      <LayoutComponent childPage="/usersphere">
        <UserSphere />
      </LayoutComponent>
    </ProtectedRoute>
  );
}
