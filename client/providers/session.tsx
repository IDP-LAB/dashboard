import { useSession } from "@/stores/auth";

export function SessionProvider ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useSession((state) => state.checkAuthStatus)()

  return children
}