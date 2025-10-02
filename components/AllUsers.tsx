"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination, Mousewheel } from "swiper/modules";

interface UserProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  role_title?: string | null;
  location?: string | null;
}

export default function AllUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // ✅ new loading state
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);

      const { data, error } = await supabase.from("users").select("*");
      if (!error && data) {
        setUsers(data.filter((u) => u.id !== user?.id));
      }

      setLoading(false); // ✅ stop loading once data comes
    };
    fetchUsers();
  }, []);

  // ✅ Show loader while fetching
  if (loading)
    return (
      <div className="flex items-center justify-center h-[calc(100vh-140px)]">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-300 mt-4">Loading users...</p>
        </div>
      </div>
    );

  // ✅ Only show "No users found" AFTER loading finished
  if (!users.length)
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-140px)] text-gray-400">
        <div className="w-20 h-20 bg-gray-800 flex items-center justify-center rounded-full shadow-lg mb-4">
          <span className="text-3xl">👤</span>
        </div>
        <p className="text-lg font-medium">No users found</p>
        <p className="text-sm text-gray-500 mt-1">Try again later.</p>
      </div>
    );

  // ✅ Show Swiper if data exists
  return (
    <div className="h-[calc(100vh-140px)] w-full rounded-lg overflow-hidden">
      <Swiper
        direction="vertical"
        slidesPerView={1}
        spaceBetween={0}
        mousewheel={true}
        pagination={{ clickable: true }}
        modules={[Pagination, Mousewheel]}
        className="h-full"
      >
        {users.map((u) => (
          <SwiperSlide key={u.id}>
            <div className="relative bg-gray-900 w-full h-full flex flex-col justify-end rounded-lg">
              {/* User Image */}
              <div className="absolute top-0 left-0 w-full h-full rounded-lg overflow-hidden">
                {u.avatar_url ? (
                  <Image
                    src={u.avatar_url}
                    alt={u.display_name || "User avatar"}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-9xl font-bold text-white">
                    {u.display_name?.[0]?.toUpperCase() || "U"}
                  </div>
                )}

                <div className="absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-gray-900/90 to-transparent rounded-lg" />
              </div>

              {/* User Info & Actions */}
              <div className="relative z-10 p-6 flex flex-col items-center gap-2 text-center">
                <h3 className="text-white text-3xl font-bold">
                  {u.display_name || "Unnamed"}
                </h3>
                {u.role_title && (
                  <p className="text-gray-300 text-sm">{u.role_title}</p>
                )}
                {u.location && (
                  <p className="text-gray-400 text-xs">{u.location}</p>
                )}
                <div className="mt-4 flex gap-3">
                  <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-full text-sm font-medium transition">
                    Connect
                  </button>
                  <button
                    className="px-6 py-2 bg-gray-700 hover:bg-gray-800 rounded-full text-sm font-medium transition"
                    onClick={() => router.push(`/user/${u.id}`)}
                  >
                    View Profile
                  </button>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
