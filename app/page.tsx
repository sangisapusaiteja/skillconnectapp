"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const handleAuth = async () => {
    setLoading(true);
    setError(null);

    if (isRegister) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else alert("Check your email for a confirmation link!");
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) setError(error.message);
      else router.push("/dashboard");
    }

    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleAuth();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black p-6">
      {/* Tagline / Hero */}
      <div className="text-center mb-8 max-full">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2">
          Exchange Skills, Not Money
        </h1>
        <p className="text-gray-400 text-sm md:text-base">
          Learn, share, and connect with like-minded people — no money required.
        </p>
      </div>

      {/* Auth Card */}
      <Card className="w-full max-w-xl bg-gray-900/90 text-white border border-gray-700 shadow-xl hover:shadow-blue-500/20 transition">
        <CardHeader>
          <CardTitle className="text-3xl text-center font-bold">
            {isRegister ? "Create Account" : "Welcome Back"}
          </CardTitle>
          <p className="text-gray-400 text-sm text-center mt-1">
            {isRegister ? "Sign up to get started" : "Login to your account"}
          </p>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <Input
            type="email"
            placeholder="Email address"
            value={email}
            className="bg-gray-800 text-white placeholder-gray-400"
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              className="bg-gray-800 text-white placeholder-gray-400 pr-10"
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2 text-gray-400 hover:text-gray-200 text-sm"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button
            onClick={handleAuth}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {loading ? "Processing..." : isRegister ? "Register" : "Login"}
          </Button>
          <p className="text-gray-400 text-sm text-center">
            {isRegister ? "Already have an account?" : "Don’t have an account?"}{" "}
            <button
              className="text-blue-400 hover:underline"
              onClick={() => setIsRegister(!isRegister)}
            >
              {isRegister ? "Login" : "Register"}
            </button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
