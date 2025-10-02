"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export interface User {
  id: string;
  bio: string;
  email: string;
  skills: string[];
  location: string;
  avatar_url: string;
  created_at: string;
  github_url: string;
  role_title: string;
  updated_at: string;
  website_url: string;
  availability: string;
  display_name: string;
  dribbble_url: string;
  linkedin_url: string;
  phone_number: number;
  followers_count: number;
  following_count: number;
  experience_level: string;
}

export interface Message {
  id: string;
  from_user: User;
  to_user: User;
  content: string;
  created_at: string;
}
export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const [toUserId, fromUserId] = decodeURIComponent(
    params.userId as string
  ).split(",");

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  console.log(messages, "messages");

  // Fetch past messages
  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*,from_user(*),to_user(*)")
        .or(
          `and(from_user.eq.${fromUserId},to_user.eq.${toUserId}),and(from_user.eq.${toUserId},to_user.eq.${fromUserId})`
        )
        .order("created_at", { ascending: true });

      if (!error && data) setMessages(data);
      setLoading(false);
    };

    fetchMessages();

    // Realtime subscription
    const channel = supabase
      .channel("chat-room")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        console.log
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fromUserId, toUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    setSending(true);

    const { error } = await supabase.from("messages").insert([
      {
        from_user: fromUserId,
        to_user: toUserId,
        content: newMessage,
      },
    ]);

    if (!error) setNewMessage("");
    setSending(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-black via-gray-900 to-black">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-300 mt-4">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">
      {/* Header */}
      <header className="px-6 md:px-12 py-4 border-b border-gray-800 sticky top-0 z-50 bg-black/80 backdrop-blur-lg flex justify-between items-center">
        <div className="flex flex-col w-full">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            💬 Chat
          </h1>
          <p className="text-gray-300 text-sm sm:text-base max-w-full mt-1 whitespace-nowrap overflow-x-auto">
            Welcome back,{" "}
            <span className="text-blue-400 font-medium">
              Exchange Skills, Not Money
            </span>{" "}
            — Discover people to learn and collaborate with.
          </p>
        </div>
        <button
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-full font-medium transition"
          onClick={() => router.back()}
        >
          Back
        </button>
      </header>

      {/* Messages */}
      <main className="px-6 md:px-12 py-4 max-w-6xl mx-auto h-[calc(100vh-140px)]">
        <div className="bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white max-w-5xl mx-auto p-6 rounded-2xl shadow-2xl flex flex-col h-full">
          <div className="flex-1 overflow-y-auto space-y-6 pr-2 hide-scrollbar">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex items-end space-x-2 ${
                  msg.from_user.id === fromUserId
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                {/* Avatar on left for other user */}
                {msg.from_user.id !== fromUserId && (
                  <div
                    className="w-14 h-14 relative flex-shrink-0 cursor-pointer overflow-hidden rounded-full transition-transform duration-200 hover:scale-110"
                    onClick={() => router.push(`/user/${msg.from_user.id}`)}
                  >
                    <Image
                      src={msg.from_user.avatar_url || "/default-avatar.png"}
                      alt={msg.from_user.display_name || "User"}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                {/* Message bubble */}
                <div
                  className={`px-4 py-2 rounded-2xl shadow-md max-w-xs sm:max-w-sm break-words ${
                    msg.from_user.id === fromUserId
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-gray-800 text-gray-200 rounded-bl-none"
                  }`}
                >
                  {msg.content}
                  <div className="text-xs text-gray-400 mt-1 text-right">
                    {new Date(msg.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>

                {/* Avatar on right for current user */}
                {msg.from_user.id === fromUserId && (
                  <div className="w-14 h-14 relative flex-shrink-0 cursor-pointer overflow-hidden rounded-full transition-transform duration-200 hover:scale-110">
                    <Image
                      src={msg.from_user.avatar_url || "/default-avatar.png"}
                      alt={msg.from_user.display_name || "User"}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="mt-4 max-w-3xl mx-auto flex space-x-2">
            <input
              type="text"
              placeholder="Type your message..."
              className="flex-1 border rounded-full px-4 py-2 bg-gray-800 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              disabled={sending}
            />
            <Button
              variant="secondary"
              onClick={handleSend}
              disabled={sending}
              className="relative flex items-center justify-center"
            >
              {sending ? (
                <div className="w-5 h-5 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Send"
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
