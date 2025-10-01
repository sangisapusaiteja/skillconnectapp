"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";

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
    };

    fetchUsers();
  }, []);

  if (!users.length)
    return <p className="text-gray-300 text-center mt-6">No users found</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {users.map((u) => (
        <div
          key={u.id}
          className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 flex flex-col items-center text-center shadow-lg hover:shadow-blue-500/20 transition hover:-translate-y-1"
        >
          {/* Avatar */}
          <div className="relative h-20 w-20 mb-3">
            <Image
              src={u.avatar_url || "/default-avatar.png"}
              alt={u.display_name || "User avatar"}
              fill
              className="rounded-full border border-gray-700 object-cover"
            />
          </div>

          {/* Name */}
          <h3 className="text-lg font-semibold">
            {u.display_name || "Unnamed user"}
          </h3>

          {/* Optional Info */}
          {u.role_title && (
            <p className="text-gray-400 text-sm">{u.role_title}</p>
          )}
          {u.location && (
            <p className="text-gray-500 text-xs">{u.location}</p>
          )}

          {/* Action (future: follow/chat) */}
          <button className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-medium transition">
            Connect
          </button>
        </div>
      ))}
    </div>
  );
}
