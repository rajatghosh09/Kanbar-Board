import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import "../index.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "React + dnd-kit + tailwind + shadcn/ui - Kanban Board",
  description: "A drag and drop Kanban Board built with React, dnd-kit, Tailwind CSS, and Shadcn UI, now migrated to Next.js.",
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
