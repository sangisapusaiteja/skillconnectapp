"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Bounce, toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
  phone_number: number | null;
  followers_count: number;
  following_count: number;
  availability: "Open" | "Busy" | "Looking for Collaboration" | null;
  updated_at: string | null;
}

export default function MyProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<UserProfile | null>(null);

  // Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!error && data) {
        setProfile(data);
        setFormData(data);
      }
    };

    fetchProfile();
  }, []);

  if (!profile || !formData)
    return (
      <p className="text-gray-300 text-center mt-10">Loading profile...</p>
    );

  // Handle input changes
  const handleChange = <K extends keyof UserProfile>(
    field: K,
    value: UserProfile[K]
  ) => {
    setFormData((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  // Cancel edit
  const handleCancel = () => {
    if (JSON.stringify(formData) !== JSON.stringify(profile)) {
      toast.warning("Changes not saved!");
    }
    setFormData(profile);
    setEditMode(false);
  };

  // Save changes
  const handleSave = async () => {
    if (JSON.stringify(formData) === JSON.stringify(profile)) {
      setEditMode(false);
      toast.info("No changes to save.");
      return;
    }

    const { error } = await supabase
      .from("users")
      .update({ ...formData, updated_at: new Date().toISOString() })
      .eq("id", profile.id);

    if (!error) {
      setProfile(formData);
      setEditMode(false);
      toast.success("Profile updated successfully!");
    } else {
      toast.error("Failed to update profile. Please try again.");
    }
  };

  return (
    <div className="bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white max-w-5xl mx-auto p-6 md:p-10 space-y-8 rounded-2xl shadow-2xl">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        transition={Bounce}
      />
      {/* Top Section */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <Avatar className="h-28 w-28 border-4 border-gray-700 shadow-lg cursor-pointer">
          <AvatarImage
            src={formData.avatar_url || ""}
            alt={formData.display_name || "User"}
          />
          <AvatarFallback className="text-xl">
            {formData.display_name?.[0]?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>

        <div className="text-center sm:text-left space-y-2 w-full">
          {editMode ? (
            <>
              <Input
                value={formData.display_name || ""}
                onChange={(e) => handleChange("display_name", e.target.value)}
                placeholder="Display Name"
              />
              <Input
                value={formData.email || ""}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="Email"
                disabled
              />
              <Input
                value={formData.phone_number?.toString() || ""}
                onChange={(e) =>
                  handleChange("phone_number", Number(e.target.value))
                }
                placeholder="Phone Number"
              />

              <Input
                value={formData.role_title || ""}
                onChange={(e) => handleChange("role_title", e.target.value)}
                placeholder="Role Title"
              />
              <Input
                value={formData.location || ""}
                onChange={(e) => handleChange("location", e.target.value)}
                placeholder="Location"
              />
              <select
                className="bg-gray-800 p-2 rounded w-full"
                value={formData.availability || ""}
                onChange={(e) =>
                  handleChange(
                    "availability",
                    e.target.value as
                      | "Open"
                      | "Busy"
                      | "Looking for Collaboration"
                      | null
                  )
                }
              >
                <option value="">Select Availability</option>
                <option value="Open">Open</option>
                <option value="Busy">Busy</option>
                <option value="Looking for Collaboration">
                  Looking for Collaboration
                </option>
              </select>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-bold tracking-tight">
                {profile.display_name || "No name set"}
              </h2>
              <p className="text-sm text-gray-400">{profile.email}</p>
              <p className="text-sm text-gray-400">{profile.phone_number}</p>
              <p className="text-lg text-gray-300">
                {profile.role_title || "No role set"}
              </p>
              <p className="text-gray-400 text-sm">
                {profile.location || "Location not set"}
              </p>
              <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium bg-gray-700 text-gray-200 shadow-sm">
                {profile.availability || "Unavailable"}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Bio */}
      <div className="bg-gray-800/50 p-5 rounded-xl shadow">
        <h3 className="font-semibold text-lg mb-2">Bio</h3>
        {editMode ? (
          <Textarea
            value={formData.bio || ""}
            onChange={(e) => handleChange("bio", e.target.value)}
            placeholder="Write your bio..."
          />
        ) : (
          <p className="text-gray-300 leading-relaxed">
            {profile.bio || "No bio set"}
          </p>
        )}
      </div>

      {/* Skills */}
      <div>
        <h3 className="font-semibold text-lg mb-3">Skills</h3>
        {editMode ? (
          <Input
            value={formData.skills?.join(", ") || ""}
            onChange={(e) =>
              handleChange(
                "skills",
                e.target.value.split(",").map((s) => s.trim()) // TypeScript now accepts this
              )
            }
            placeholder="Enter skills separated by commas"
          />
        ) : (
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
        )}
      </div>

      {/* Links */}
      <div className="flex gap-6 flex-wrap text-sm text-gray-300">
        <div className="flex flex-wrap gap-4 items-center">
          {[
            { field: "website_url", label: "Website", icon: "🌐" },
            { field: "github_url", label: "GitHub", icon: "💻" },
            { field: "linkedin_url", label: "LinkedIn", icon: "🔗" },
            { field: "dribbble_url", label: "Dribbble", icon: "🎨" },
          ].map(({ field, label, icon }) =>
            editMode ? (
              <Input
                key={field}
                value={(formData[field as keyof UserProfile] as string) || ""}
                onChange={(e) =>
                  handleChange(field as keyof UserProfile, e.target.value)
                }
                placeholder={`${label} URL`}
                className="w-56"
              />
            ) : (
              formData[field as keyof UserProfile] && (
                <a
                  key={field}
                  href={formData[field as keyof UserProfile] as string}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white"
                >
                  {icon} {label}
                </a>
              )
            )
          )}
        </div>
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
        <div>
          {editMode ? (
            <select
              className="bg-gray-800 border border-gray-700 p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:outline-none h-full"
              value={formData.experience_level || ""}
              onChange={(e) =>
                handleChange(
                  "experience_level",
                  e.target.value as
                    | "Beginner"
                    | "Intermediate"
                    | "Expert"
                    | null
                )
              }
            >
              <option value="">Select Experience</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Expert">Expert</option>
            </select>
          ) : (
            profile.experience_level && (
              <div className="bg-gray-800/50 p-4 rounded-lg shadow flex flex-col items-start">
                <span className="text-xl font-semibold text-white">
                  {profile.experience_level}
                </span>
                <span className="text-gray-400 text-sm">Experience Level</span>
              </div>
            )
          )}
        </div>
      </div>

      {/* Updated */}
      <p className="text-gray-500 text-xs text-center sm:text-right">
        Last updated:{" "}
        {profile.updated_at
          ? new Date(profile.updated_at).toLocaleString()
          : "N/A"}
      </p>

      {/* Edit/Save/Cancel Buttons */}
      <div className="flex gap-4 justify-end">
        {editMode ? (
          <>
            <Button variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </>
        ) : (
          <Button onClick={() => setEditMode(true)}>Edit Profile</Button>
        )}
      </div>
    </div>
  );
}
