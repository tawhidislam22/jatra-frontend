import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { getServerCurrentUser } from "@/lib/server-auth";

export default async function CommonLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getServerCurrentUser();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar initialUser={user} />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
