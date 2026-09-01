import { AppFrame } from "@/components/app/app-frame";
import { AuthGate } from "@/components/auth/auth-gate";

export default function AppGroupLayout({ children }: LayoutProps<"/">) {
  return (
    <AuthGate>
      <AppFrame>{children}</AppFrame>
    </AuthGate>
  );
}
