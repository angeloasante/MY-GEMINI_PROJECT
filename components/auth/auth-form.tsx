"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Github, Command } from "lucide-react";

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPasswordStep, setShowPasswordStep] = useState(false);
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setShowPasswordStep(true);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: undefined,
          },
        });
        if (error) throw error;
        
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Dark with testimonial */}
      <div className="hidden lg:flex lg:w-1/2 bg-zinc-950 flex-col justify-between p-8 relative">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 flex items-center justify-center">
            <Command className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-medium">Gaslighter Detect</span>
        </div>
        
        {/* Testimonial */}
        <div className="text-white/90 text-sm leading-relaxed">
          <p>
            &quot;This app has helped me recognize manipulation patterns I never saw before. 
            It&apos;s like having a supportive friend who helps you see clearly.&quot; - Sarah M.
          </p>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 bg-zinc-950 lg:bg-zinc-900 flex flex-col">
        {/* Top bar with Login link */}
        <div className="flex justify-between items-center p-6">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2">
            <Command className="w-5 h-5 text-white" />
            <span className="text-white font-medium">Gaslighter Detect</span>
          </div>
          <div className="hidden lg:block" />
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setShowPasswordStep(false);
              setError(null);
            }}
            className="text-white/80 hover:text-white text-sm transition-colors"
          >
            {isLogin ? "Sign Up" : "Login"}
          </button>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center px-8">
          <div className="w-full max-w-sm">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-semibold text-white mb-2">
                {isLogin ? "Welcome back" : "Create an account"}
              </h1>
              <p className="text-zinc-400 text-sm">
                {isLogin 
                  ? "Enter your email to sign in to your account"
                  : "Enter your email below to create your account"
                }
              </p>
            </div>

            {!showPasswordStep ? (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <Input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-transparent border-zinc-800 text-white placeholder:text-zinc-500 h-10 focus:border-zinc-600 focus:ring-0"
                />
                
                <Button
                  type="submit"
                  className="w-full bg-white hover:bg-zinc-200 text-black font-medium h-10"
                >
                  Sign In with Email
                </Button>
              </form>
            ) : (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="text-sm text-zinc-400 mb-2">
                  Signing in as <span className="text-white">{email}</span>
                  <button 
                    type="button"
                    onClick={() => setShowPasswordStep(false)}
                    className="text-zinc-500 hover:text-white ml-2"
                  >
                    (change)
                  </button>
                </div>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoFocus
                  className="bg-transparent border-zinc-800 text-white placeholder:text-zinc-500 h-10 focus:border-zinc-600 focus:ring-0"
                />
                
                {error && (
                  <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-md p-3">
                    {error}
                  </div>
                )}
                
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white hover:bg-zinc-200 text-black font-medium h-10"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      {isLogin ? "Signing in..." : "Creating account..."}
                    </span>
                  ) : isLogin ? (
                    "Sign In"
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
            )}

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-zinc-950 lg:bg-zinc-900 px-2 text-zinc-500">
                  Or continue with
                </span>
              </div>
            </div>

            {/* GitHub Button */}
            <Button
              type="button"
              variant="outline"
              onClick={handleGitHubSignIn}
              disabled={loading}
              className="w-full bg-transparent border-zinc-800 text-white hover:bg-zinc-800 hover:text-white h-10"
            >
              <Github className="w-4 h-4 mr-2" />
              GitHub
            </Button>

            {/* Terms */}
            <p className="text-center text-xs text-zinc-500 mt-6">
              By clicking continue, you agree to our{" "}
              <a href="#" className="underline hover:text-zinc-300">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="underline hover:text-zinc-300">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
