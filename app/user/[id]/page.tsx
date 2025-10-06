"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import { UserProfile } from "@/components/MyProfile";

export default function ViewUserProfile() {
  const params = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState<Pick<
    UserProfile,
    "id" | "display_name" | "avatar_url"
  > | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        router.push("/"); // redirect if not logged in
        return;
      }

      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        const { data: profileData, error } = await supabase
          .from("users")
          .select("id, display_name, avatar_url")
          .eq("id", userData.user.id)
          .single();
        if (!error) setUser(profileData);
      }

      setLoading(false);
    };

    fetchUser();
  }, [router]);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", params.id)
        .single();

      if (!error && data) {
        setProfile(data);
      }
    };
    fetchProfile();
  }, [params.id]);

  if (!profile)
    return (
      <div className="flex items-center justify-center h-[calc(100vh-140px)]">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-300 mt-4">Loading profile...</p>
        </div>
      </div>
    );

  return (
    <div className="flex  items-center justify-center bg-gradient-to-b from-black via-gray-900 to-black text-white h-[calc(100vh-110px)] ">
      {/* Main content */}
      <main className="px-6 md:px-12 py-4 min-w-6xl mx-auto">
        <div className="bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white max-w-5xl mx-auto p-6  space-y-6 rounded-2xl shadow-2xl">
          {/* Top Section */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative h-60 w-80 rounded-full border-4 border-gray-700 shadow-lg overflow-hidden">
              <Image
                src={profile.avatar_url || "/default-avatar.png"}
                alt={profile.display_name || "User"}
                fill
                className="object-cover"
              />
              {!profile.avatar_url && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-9xl font-bold text-white">
                  {profile.display_name?.[0]?.toUpperCase() || "U"}
                </div>
              )}
            </div>

            <div className="text-center sm:text-left space-y-2 w-full">
              <h2 className="text-3xl font-bold tracking-tight">
                {profile.display_name || "No name set"}
              </h2>
              <p className="text-sm text-gray-400">
                {profile.email || "No email"}
              </p>
              <p className="text-sm text-gray-400">
                {profile.phone_number || "No phone"}
              </p>
              <p className="text-lg text-gray-300">
                {profile.role_title || "No role set"}
              </p>
              <p className="text-gray-400 text-sm">
                {profile.location || "Location not set"}
              </p>
              <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium bg-gray-700 text-gray-200 shadow-sm">
                {profile.availability || "Unavailable"}
              </span>
            </div>
          </div>

          {/* Bio */}
          <div className="bg-gray-800/50 p-5 rounded-xl shadow">
            <h3 className="font-semibold text-lg mb-2">Bio</h3>
            <p className="text-gray-300 leading-relaxed">
              {profile.bio || "No bio set"}
            </p>
          </div>

          {/* Skills */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {profile.skills?.map((skill) => (
                <span
                  key={skill}
                  className="px-4 py-1 bg-gray-700 rounded-full text-sm text-gray-200 shadow-sm"
                >
                  {skill}
                </span>
              )) || <p className="text-gray-400">No skills added</p>}
            </div>
          </div>

          {/* Links */}
          <div className="flex gap-6 flex-wrap text-sm text-gray-300">
            {[
              { field: "website_url", label: "Website", icon: "🌐" },
              { field: "github_url", label: "GitHub", icon: "💻" },
              { field: "linkedin_url", label: "LinkedIn", icon: "🔗" },
              { field: "dribbble_url", label: "Dribbble", icon: "🎨" },
            ].map(({ field, label, icon }) =>
              profile[field as keyof UserProfile] ? (
                <a
                  key={field}
                  href={profile[field as keyof UserProfile] as string}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white"
                >
                  {icon} {label}
                </a>
              ) : null
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
              <div className="bg-gray-800/50 p-4 rounded-lg shadow flex flex-col items-start">
                <span className="text-xl font-semibold text-white">
                  {profile.experience_level}
                </span>
                <span className="text-gray-400 text-sm">Experience Level</span>
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
      </main>
    </div>
  );
}
