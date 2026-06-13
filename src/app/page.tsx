"use client";

import dynamic from "next/dynamic";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabaseclient";
import { toast } from "sonner";
import { LogOut } from "lucide-react";

const KanbanBoard = dynamic(
  () =>
    import("@/components/KanbanBoard").then(
      (mod) => mod.KanbanBoard
    ),
  {
    ssr: false,
  }
);

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      const { error } = await supabaseClient.auth.signOut();

      if (error) {
        toast.error(error.message);
        return;
      }

      localStorage.removeItem("loginTime");

      toast.success("Logged out successfully");

      router.replace("/login");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabaseClient.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const name =
        user.user_metadata?.full_name ||
        user.user_metadata?.username ||
        user.email?.split("@")[0] ||
        "User";
      setUserName(name);

      const loginTime = localStorage.getItem("loginTime");

      if (!loginTime) {
        await supabaseClient.auth.signOut();
        router.replace("/login");
        return;
      }

      const oneDay = 24 * 60 * 60 * 1000;

      if (Date.now() - Number(loginTime) > oneDay) {
        await supabaseClient.auth.signOut();

        localStorage.removeItem("loginTime");

        toast.error("Session expired. Please login again.");

        router.replace("/login");
      }
    };

    checkUser();
  }, [router]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background/95 relative overflow-hidden">
      {/* Subtle ambient lighting for a premium vibe */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between p-4 h-16">
          <div className="flex items-center gap-3">
            <div className="bg-primary text-primary-foreground p-2 rounded-xl font-black text-lg tracking-wider flex items-center justify-center w-10 h-10 shadow-md transform hover:rotate-6 transition-transform">
              KF
            </div>
            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-lg">KanbanFlow</span>
              {userName && (
                <span className="text-xs text-muted-foreground">
                  Hi, <span className="font-medium text-foreground">{userName}</span>
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2 text-muted-foreground hover:text-destructive transition-colors duration-200"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline font-medium">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full px-4 md:px-8 py-8 flex-grow flex flex-col gap-6 relative z-10">
        <div className="flex flex-col gap-1 mb-2">
          <h2 className="text-3xl font-extrabold tracking-tight lg:text-4xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            My Workspace
          </h2>
          <p className="text-muted-foreground text-sm">
            Manage your boards and keep track of your task progression.
          </p>
        </div>

        <KanbanBoard />
      </main>
    </div>
  );
}