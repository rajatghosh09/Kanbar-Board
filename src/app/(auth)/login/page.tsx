"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  loginSchema,
  LoginFormData,
} from "@/service/validation/registervalidation";
import { useUserAuth } from "@/zustand/userAuth";
import { supabaseClient } from "@/lib/supabaseclient";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";

const Login = () => {
  const router = useRouter();
  const { loading, setLoading } = useUserAuth();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabaseClient.auth.getUser();

      if (user) {
        router.replace("/");
      }
    };

    checkUser();
  }, [router]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormData) => {
    try {
      setLoading(true);

      const { error } = await supabaseClient.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Welcome back!");
      localStorage.setItem("loginTime", Date.now().toString());
      reset();

      router.replace("/");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 bg-background/95 relative overflow-hidden">
      {/* Soft background glow circles */}
      <div className="absolute top-[-20%] left-[-15%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-15%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-[130px] pointer-events-none" />

      <Card className="w-full max-w-md border-border/60 bg-card/75 backdrop-blur-md shadow-xl rounded-2xl relative z-10 p-2">
        <CardHeader className="flex flex-col items-center pb-2 pt-6">
          <div className="bg-primary text-primary-foreground p-3 rounded-2xl font-black text-xl tracking-wider flex items-center justify-center w-12 h-12 shadow-lg mb-3 transform hover:rotate-6 transition-transform">
            KF
          </div>
          <CardTitle className="text-2xl font-extrabold text-center tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-center text-xs text-muted-foreground/90 mt-1">
            Login to manage your boards and tasks
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground/85">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/80" />
                <Input
                  type="email"
                  placeholder="name@example.com"
                  className="pl-10 h-10 border-border/60 focus-visible:ring-1 focus-visible:ring-primary/30 rounded-xl"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive mt-1 pl-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-semibold text-foreground/85">
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-muted-foreground hover:text-foreground hover:underline transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/80" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-10 border-border/60 focus-visible:ring-1 focus-visible:ring-primary/30 rounded-xl"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground/80 hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive mt-1 pl-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-10 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200 mt-6"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>

            {/* Registration link */}
            <p className="text-center text-xs text-muted-foreground mt-4 pt-2 border-t border-border/40">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="font-semibold text-foreground hover:underline"
              >
                Create Account
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </main>
  );
};

export default Login;
