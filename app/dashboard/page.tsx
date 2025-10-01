"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import * as Tabs from "@radix-ui/react-tabs";

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

      <Tabs.Root defaultValue="profile">
        <Tabs.List className="flex border-b border-gray-700 mb-4">
          <Tabs.Trigger
            value="profile"
            className="px-4 py-2 border-b-2 border-transparent data-[state=active]:border-blue-500"
          >
            My Profile
          </Tabs.Trigger>
          <Tabs.Trigger
            value="people"
            className="px-4 py-2 border-b-2 border-transparent data-[state=active]:border-blue-500"
          >
            People
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="profile">
          <MyProfile />
        </Tabs.Content>
        <Tabs.Content value="people">
          <AllUsers />
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
