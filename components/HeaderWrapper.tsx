"use client";

import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useUserContext } from "@/context/UserContext";

export default function HeaderWrapper() {
  const pathname = usePathname();

  console.log(pathname, "pathname");

  // Hide header on login page
  if (pathname === "/") return null;

  return <Header />;
}

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { profileClicked, setProfileClicked } = useUserContext(); // ✅ get global state
  const [user, setUser] = useState<{
    id: string;
    display_name?: string;
    avatar_url?: string;
  } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        const { data: profileData } = await supabase
          .from("users")
          .select("id, display_name, avatar_url")
          .eq("id", userData.user.id)
          .single();
        if (profileData) setUser(profileData);
      }
    };
    fetchUser();
  }, []);

  const ToShowBack =
    pathname.includes("/user/") || pathname.includes("/messages/");
  return (
    <header className="px-6 md:px-12 py-4 border-b border-gray-800 sticky top-0 z-50 bg-black/80 backdrop-blur-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div className="flex flex-col w-full">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
          {pathname.includes("/messages/") ? "💬 Chat" : "SkillConnect"}
        </h1>
        <p className="text-gray-300 text-sm sm:text-base max-w-full mt-1 whitespace-nowrap overflow-x-auto">
          Welcome back,{" "}
          <span className="text-blue-400 font-medium">
            Exchange Skills, Not Money
          </span>{" "}
          — Discover people to learn and collaborate with.
        </p>
      </div>

      <div className="flex items-center gap-4">
        {!profileClicked &&
          user &&
          !pathname.includes("/user/") &&
          !pathname.includes("/messages/") && (
            <button
              className="relative rounded-full border-2 border-gray-700 overflow-hidden w-12 h-12 transform transition duration-300 hover:scale-110"
              onClick={() => setProfileClicked(true)} // ✅ click avatar
            >
              {user.avatar_url ? (
                <Image
                  src={user.avatar_url}
                  alt={user.display_name || "User"}
                  width={48}
                  height={48}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-800 text-3xl font-bold text-white">
                  {user.display_name?.[0]?.toUpperCase() || "U"}
                </div>
              )}
            </button>
          )}

        {profileClicked && (
          <button
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-full font-medium transition"
            onClick={() => setProfileClicked(false)} // ✅ Back button resets
          >
            Back
          </button>
        )}
        {ToShowBack && (
          <button
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-full font-medium transition"
            onClick={() => router.back()}
          >
            Back
          </button>
        )}

        {/* Logout Button */}
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            router.push("/");
          }}
          className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-full font-medium transition"
        >
          Logout
        </button>
      </div>
    </header>
  );
};
