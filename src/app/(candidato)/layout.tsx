import NavbarPublic from "@/components/navbar-public";
import { auth } from "@/lib/auth/auth";

export default async function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <NavbarPublic session={session} />
      {children}
    </div>
  );
}

