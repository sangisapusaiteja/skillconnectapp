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

  if (loading) return <p className="text-white p-8">Loading...</p>;

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-[300px] grid-cols-2 bg-gray-800 rounded-lg">
          <TabsTrigger
            value="profile"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            My Profile
          </TabsTrigger>
          <TabsTrigger
            value="people"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            People
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <MyProfile />
        </TabsContent>
        <TabsContent value="people" className="mt-6">
          <AllUsers />
        </TabsContent>
      </Tabs>
    </div>
  );
}
