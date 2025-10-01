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
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const handleAuth = async () => {
    setLoading(true);
    setError(null);

    if (isRegister) {
      // Sign up
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) setError(error.message);
      else {
        alert("Check your email for confirmation link!");
      }
    } else {
      // Sign in
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) setError(error.message);
      else router.push("/dashboard");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <Card className="w-full max-w-sm bg-gray-900 text-white border-gray-700">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {isRegister ? "Register" : "Login"}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            className="bg-gray-800 text-white"
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            className="bg-gray-800 text-white"
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button
            onClick={handleAuth}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {loading ? "Processing..." : isRegister ? "Register" : "Login"}
          </Button>
          <p className="text-gray-400 text-sm text-center">
            {isRegister
              ? "Already have an account?"
              : "Don't have an account?"}{" "}
            <button
              className="text-blue-500 underline"
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
