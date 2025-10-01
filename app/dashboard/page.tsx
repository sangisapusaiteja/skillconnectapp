"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import MyProfile from "@/components/MyProfile";
import AllUsers from "@/components/AllUsers";
import { supabase } from "@/lib/supabaseClient";

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.push("/"); // redirect if not logged in
      } else {
        setLoading(false);
      }
    });
  }, [router]);

  if (loading)
    return <p className="text-gray-300 p-8 text-center">Loading...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">
      {/* Header */}
      <header className="px-6 md:px-12 py-6 border-b border-gray-800 sticky top-0 z-50 bg-black/80 backdrop-blur-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          {/* Dashboard title */}
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Dashboard
          </h1>

          {/* Welcome message + tagline */}
          <p className="text-gray-300 text-sm sm:text-base max-w-lg">
            Welcome back,
            <span className="text-blue-400 font-medium">
              Exchange Skills, Not Money
            </span>{" "}
            — Discover people to learn and collaborate with.
          </p>
        </div>
      </header>

      {/* Tabs */}
      <main className="px-6 md:px-12 py-8 max-w-6xl mx-auto">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="flex bg-gray-800/80 rounded-lg p-1 w-fit shadow">
            <TabsTrigger
              value="profile"
              className="px-6 py-2 rounded-md text-sm font-medium transition
                data-[state=active]:bg-blue-600 data-[state=active]:text-white
                data-[state=inactive]:text-gray-300 hover:text-white"
            >
              My Profile
            </TabsTrigger>
            <TabsTrigger
              value="people"
              className="px-6 py-2 rounded-md text-sm font-medium transition
                data-[state=active]:bg-blue-600 data-[state=active]:text-white
                data-[state=inactive]:text-gray-300 hover:text-white"
            >
              People
            </TabsTrigger>
          </TabsList>

          {/* Tab Content */}
          <div className="mt-8">
            <TabsContent value="profile" className="space-y-6">
              <MyProfile />
            </TabsContent>
            <TabsContent value="people" className="space-y-6">
              <AllUsers />
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  );
}
