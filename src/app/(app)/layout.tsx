import { AppFrame } from "@/components/app/app-frame";
import { AuthGate } from "@/components/auth/auth-gate";
import { CloudSync } from "@/lib/store/cloud-sync";

export default function AppGroupLayout({ children }: LayoutProps<"/">) {
  return (
    <AuthGate>
      <CloudSync>
        <AppFrame>{children}</AppFrame>
      </CloudSync>
    </AuthGate>
  );
}
