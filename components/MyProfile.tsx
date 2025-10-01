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

  if (!profile) return <p className="text-gray-300 text-center mt-10">Loading profile...</p>;

  return (
    <div className="bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white max-w-5xl mx-auto p-6 md:p-10 space-y-8 rounded-2xl shadow-2xl">
      {/* Top Section */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Avatar */}
        <Avatar className="h-28 w-28 border-4 border-gray-700 shadow-lg">
          <AvatarImage src={profile.avatar_url || ""} alt={profile.display_name || "User"} />
          <AvatarFallback className="text-xl">
            {profile.display_name?.[0]?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>

        {/* Basic Info */}
        <div className="text-center sm:text-left space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">
            {profile.display_name || "No name set"}
          </h2>
          <p className="text-lg text-gray-300">{profile.role_title || "No role set"}</p>
          <p className="text-gray-400 text-sm">{profile.location || "Location not set"}</p>
          <span
            className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium
              bg-gray-700 text-gray-200 shadow-sm"
          >
            {profile.availability || "Unavailable"}
          </span>
        </div>
      </div>

      {/* Bio */}
      {profile.bio && (
        <div className="bg-gray-800/50 p-5 rounded-xl shadow">
          <h3 className="font-semibold text-lg mb-2">Bio</h3>
          <p className="text-gray-300 leading-relaxed">{profile.bio}</p>
        </div>
      )}

      {/* Skills */}
      {profile.skills && profile.skills.length > 0 && (
        <div>
          <h3 className="font-semibold text-lg mb-3">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill) => (
              <span
                key={skill}
                className="px-4 py-1 bg-gray-700 rounded-full text-sm text-gray-200 shadow-sm hover:bg-gray-600 transition"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Links */}
      <div className="flex gap-6 flex-wrap text-sm text-gray-300">
        {profile.website_url && (
          <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="hover:text-white">
            🌐 Website
          </a>
        )}
        {profile.github_url && (
          <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="hover:text-white">
            💻 GitHub
          </a>
        )}
        {profile.linkedin_url && (
          <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="hover:text-white">
            🔗 LinkedIn
          </a>
        )}
        {profile.dribbble_url && (
          <a href={profile.dribbble_url} target="_blank" rel="noopener noreferrer" className="hover:text-white">
            🎨 Dribbble
          </a>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-center sm:text-left">
        <div className="bg-gray-800/50 p-4 rounded-lg shadow">
          <p className="text-xl font-semibold">{profile.followers_count}</p>
          <p className="text-gray-400 text-sm">Followers</p>
        </div>
        <div className="bg-gray-800/50 p-4 rounded-lg shadow">
          <p className="text-xl font-semibold">{profile.following_count}</p>
          <p className="text-gray-400 text-sm">Following</p>
        </div>
        {profile.experience_level && (
          <div className="bg-gray-800/50 p-4 rounded-lg shadow">
            <p className="text-xl font-semibold">{profile.experience_level}</p>
            <p className="text-gray-400 text-sm">Experience</p>
          </div>
        )}
      </div>

      {/* Updated */}
      <p className="text-gray-500 text-xs text-center sm:text-right">
        Last updated:{" "}
        {profile.updated_at
          ? new Date(profile.updated_at).toLocaleString()
          : "N/A"}
      </p>
    </div>
  );
}
