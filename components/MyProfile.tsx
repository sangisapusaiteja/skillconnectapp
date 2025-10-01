"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

interface UserProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  email: string;
  bio: string | null;
  skills: string[] | null;
  experience_level: "Beginner" | "Intermediate" | "Expert" | null;
  role_title: string | null;
  location: string | null;
  website_url: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  dribbble_url: string | null;
  followers_count: number;
  following_count: number;
  availability: "Open" | "Busy" | "Looking for Collaboration" | null;
  updated_at: string | null;
}

export default function MyProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!error) setProfile(data);
    };

    fetchProfile();
  }, []);

  if (!profile) return <p className="text-white">Loading profile...</p>;

  return (
    <div className="bg-gray-900 text-white max-w-2xl mx-auto p-6 space-y-6 rounded-lg shadow">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <Avatar className="h-20 w-20">
          <AvatarImage src={profile.avatar_url || ""} alt={profile.display_name || "User"} />
          <AvatarFallback>
            {profile.display_name?.[0]?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>

        {/* Basic Info */}
        <div>
          <h2 className="text-2xl font-bold">
            {profile.display_name || "No name set"}
          </h2>
          <p className="text-gray-400">{profile.role_title || "No role set"}</p>
          <p className="text-gray-500 text-sm">
            {profile.location || "Location not set"}
          </p>
          <div className="mt-1">{profile.availability || "Unavailable"}</div>
        </div>
      </div>

      {/* Bio */}
      {profile.bio && (
        <div>
          <h3 className="font-semibold text-lg">Bio</h3>
          <p className="text-gray-300">{profile.bio}</p>
        </div>
      )}

      {/* Skills */}
      {profile.skills && profile.skills.length > 0 && (
        <div>
          <h3 className="font-semibold text-lg">Skills</h3>
          <div className="flex flex-wrap gap-2 mt-1">
            {profile.skills.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1 bg-gray-800 rounded-md text-sm text-gray-200"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Links */}
      <div className="flex gap-4 flex-wrap text-sm text-gray-400">
        {profile.website_url && (
          <a
            href={profile.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            Website
          </a>
        )}
        {profile.github_url && (
          <a
            href={profile.github_url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            GitHub
          </a>
        )}
        {profile.linkedin_url && (
          <a
            href={profile.linkedin_url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            LinkedIn
          </a>
        )}
        {profile.dribbble_url && (
          <a
            href={profile.dribbble_url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            Dribbble
          </a>
        )}
      </div>

      {/* Stats */}
      <div className="flex gap-6 text-gray-300 mt-4">
        <div>
          <p className="font-semibold">{profile.followers_count}</p>
          <p className="text-sm">Followers</p>
        </div>
        <div>
          <p className="font-semibold">{profile.following_count}</p>
          <p className="text-sm">Following</p>
        </div>
        {profile.experience_level && (
          <div>
            <p className="font-semibold">{profile.experience_level}</p>
            <p className="text-sm">Experience</p>
          </div>
        )}
      </div>

      {/* Updated */}
      <p className="text-gray-500 text-xs">
        Last updated:{" "}
        {profile.updated_at
          ? new Date(profile.updated_at).toLocaleString()
          : "N/A"}
      </p>
    </div>
  );
}
