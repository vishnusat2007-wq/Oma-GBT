import { AppFrame } from "@/components/app/app-frame";

export default function AppGroupLayout({ children }: LayoutProps<"/">) {
  return <AppFrame>{children}</AppFrame>;
}
