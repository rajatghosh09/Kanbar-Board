import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import "../index.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Kanban Board",
  description: "A drag and drop Kanban Board built with Next.js, Supabase, dnd-kit, and Shadcn UI.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-background text-foreground">
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
