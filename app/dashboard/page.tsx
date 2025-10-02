"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import MyProfile from "@/components/MyProfile";
import AllUsers from "@/components/AllUsers";
import { supabase } from "@/lib/supabaseClient";

interface UserProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
}

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [viewProfile, setViewProfile] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        router.push("/"); // redirect if not logged in
        return;
      }

      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        const { data: profileData, error } = await supabase
          .from("users")
          .select("id, display_name, avatar_url")
          .eq("id", userData.user.id)
          .single();
        if (!error) setUser(profileData);
      }

      setLoading(false);
    };

    fetchUser();
  }, [router]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-300 mt-4 text-center text-lg">Loading...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">
      {/* Header */}
      <header className="px-6 md:px-12 py-4 border-b border-gray-800 sticky top-0 z-50 bg-black/80 backdrop-blur-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col w-full">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            SkillConnect
          </h1>
          <p className="text-gray-300 text-sm sm:text-base max-w-full mt-1 whitespace-nowrap overflow-x-auto">
            Welcome back,{" "}
            <span className="text-blue-400 font-medium">
              Exchange Skills, Not Money
            </span>{" "}
            — Discover people to learn and collaborate with.
          </p>
        </div>

        {user && !viewProfile && (
          <button
            onClick={() => setViewProfile(true)}
            className="rounded-full border-2 border-gray-700 overflow-hidden w-12 h-12 transform transition duration-300 hover:scale-110"
          >
            <Image
              src={user.avatar_url || "/default-avatar.png"}
              alt={user.display_name || "User"}
              width={48}
              height={48}
              className="object-cover w-full h-full"
            />
          </button>
        )}

        {viewProfile && (
          <button
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-full font-medium transition"
            onClick={() => setViewProfile(false)}
          >
            Back
          </button>
        )}
      </header>

      {/* Main content */}
      <main className="px-6 md:px-12 py-4 max-w-6xl mx-auto">
        {viewProfile ? <MyProfile /> : <AllUsers />}
      </main>
    </div>
  );
}
