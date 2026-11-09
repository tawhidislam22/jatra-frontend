import { Toaster } from "@/components/ui/sonner";
import QueryProviders from "@/providers/QueryProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { AuthProvider } from "@/context/AuthContext";
import { getServerCurrentUser } from "@/lib/server-auth";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jatra - Smart Vehicle Rental & Service",
  description: "Your premium platform for vehicle rentals and professional maintenance.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialUser = await getServerCurrentUser();

  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProviders>
            <AuthProvider initialUser={initialUser}>
              {children}
              <Toaster position="top-right" richColors />
            </AuthProvider>
          </QueryProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}
