"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface UserProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
}

export default function AllUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  console.log(currentUserId, "currentUserId");

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
          <span>{u.display_name || "Unnamed user"}</span>
        </div>
      ))}
    </div>
  );
}
