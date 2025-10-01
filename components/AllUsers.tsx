"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";

interface UserProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
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

  if (!users.length) return <p className="text-white">No users found</p>;

  return (
    <div className="grid gap-4 text-white">
      {users.map((u) => (
        <div
          key={u.id}
          className="flex items-center gap-4 border p-3 rounded-lg"
        >
          {/* Avatar */}
          <Image
            src={u.avatar_url || "/default-avatar.png"} // fallback image
            alt={u.display_name || "User avatar"}
            width={40}
            height={40}
            className="rounded-full border"
          />

          {/* Name */}
          <span>{u.display_name || "Unnamed user"}</span>
        </div>
      ))}
    </div>
  );
}
