"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import MyProfile from "@/components/MyProfile";
import AllUsers from "@/components/AllUsers";
import { supabase } from "@/lib/supabaseClient";
import { useUserContext } from "@/context/UserContext"; // ✅ Global context to track profile view

export interface UserProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
}

export default function Dashboard() {
  const router = useRouter();
  const { profileClicked } = useUserContext(); // ✅ Global state: is profile being viewed?
  const [loading, setLoading] = useState(true);

  // Fetch session and check authentication
  useEffect(() => {
    const fetchUserSession = async () => {
      const { data: sessionData } = await supabase.auth.getSession();

      // If user is not logged in, redirect to login page
      if (!sessionData.session) {
        router.push("/");
        return;
      }

      setLoading(false); // Session valid, stop loading
    };

    fetchUserSession();
  }, [router]);

  // Show a loading spinner while checking session
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-140px)]">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-300 mt-4 text-center text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Main dashboard content
  return (
    <div className="bg-gradient-to-b from-black via-gray-900 to-black text-white">
      <main className="px-6 md:px-12 py-4 max-w-6xl mx-auto">
        {/* Conditionally render MyProfile or AllUsers based on global state */}
        {profileClicked ? <MyProfile /> : <AllUsers />}
      </main>
    </div>
  );
}
