"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { UserProfile } from "@/app/dashboard/page";

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
  created_at: string;
  content: string;
  from_user: User;
  to_user: User;
}

interface ChatUser {
  user: User;
  lastMessage: string;
  lastMessageTime: string;
}

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const [toUserId, setToUserId] = useState<string | null>(null);
  const [fromUserId, setFromUserId] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);

  const ids = decodeURIComponent(params.userId as string).split(",");
  const firstId = ids[0];

  // Determine users based on URL and fetch latest chat if only one ID
  useEffect(() => {
    const initUsers = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const ids = decodeURIComponent(params.userId as string).split(",");

      if (ids.length === 2) {
        setFromUserId(ids[0]);
        setToUserId(ids[1]);
      }
    };

    initUsers();
  }, [params.userId, router]);

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

  // Fetch chat list
  useEffect(() => {
    const fetchChatUsers = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("messages")
        .select("id, created_at, content, from_user(*), to_user(*)")
        .or(`from_user.eq.${user.id},to_user.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        return;
      }
      const typedData = data as unknown as Message[];

      const seen = new Map<string, ChatUser>();

      typedData.forEach((msg: Message) => {
        const other =
          msg.from_user.id === user.id ? msg.to_user : msg.from_user;
        console.log(msg, "msg");

        if (!seen.has(other.id)) {
          seen.set(other.id, {
            user: other,
            lastMessage: msg.content,
            lastMessageTime: msg.created_at,
          });
        }
      });

      setChatUsers(Array.from(seen.values()));
    };

    fetchChatUsers();
  }, []);

  // Fetch messages whenever toUserId or fromUserId changes
  useEffect(() => {
    if (!toUserId || !fromUserId) {
      setLoading(false);
      return;
    }

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*, from_user(*), to_user(*)")
        .or(
          `and(from_user.eq.${fromUserId},to_user.eq.${toUserId}),and(from_user.eq.${toUserId},to_user.eq.${fromUserId})`
        )
        .order("created_at", { ascending: true });

      if (!error && data) {
        setMessages(data);

        // If no messages yet between these users
        if (data.length === 0 && toUserId) {
          const { data: userData } = await supabase
            .from("users")
            .select("*")
            .eq("id", toUserId)
            .single();

          if (userData) {
            setChatUsers((prev) => {
              // Avoid duplicates
              if (prev.some((c) => c.user.id === toUserId)) return prev;
              return [
                {
                  user: userData as User,
                  lastMessage: "",
                  lastMessageTime: new Date().toISOString(),
                },
                ...prev,
              ];
            });
          }
        }
      }

      setLoading(false);
    };

    fetchMessages();
    const channel = supabase
      .channel(`chat-${fromUserId}-${toUserId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        async (payload) => {
          const newRow = payload.new;

          // ✅ Only allow messages for current chat
          const isCurrentChat =
            (newRow.from_user === fromUserId && newRow.to_user === toUserId) ||
            (newRow.from_user === toUserId && newRow.to_user === fromUserId);

          if (!isCurrentChat) return;

          // 🔥 Fetch full message with joins
          const { data, error } = await supabase
            .from("messages")
            .select("*, from_user(*), to_user(*)")
            .eq("id", newRow.id)
            .single();

          if (error || !data) return;

          // ✅ Prevent duplicate messages
          setMessages((prev) => {
            if (prev.some((m) => m.id === data.id)) return prev;
            return [...prev, data];
          });

          // ✅ Update sidebar last message
          setChatUsers((prev) => {
            const otherUser =
              data.from_user.id === fromUserId ? data.to_user : data.from_user;

            const exists = prev.find((c) => c.user.id === otherUser.id);

            if (!exists) {
              return [
                {
                  user: otherUser,
                  lastMessage: data.content,
                  lastMessageTime: data.created_at,
                },
                ...prev,
              ];
            }

            return prev.map((c) =>
              c.user.id === otherUser.id
                ? {
                    ...c,
                    lastMessage: data.content,
                    lastMessageTime: data.created_at,
                  }
                : c
            );
          });
        }
      )
      .subscribe((status) => {
        console.log("📡 Chat realtime status:", status);
      });
  }, [fromUserId, toUserId]);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    // Use requestAnimationFrame to wait for layout
    requestAnimationFrame(() => {
      container.scrollTop = container.scrollHeight;
    });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !fromUserId || !toUserId) return;
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

  // Ensure the selected user details are always available
  useEffect(() => {
    const ensureSelectedUser = async () => {
      if (!toUserId) return;

      // Check if already in chatUsers
      const found = chatUsers.find((c) => c.user.id === toUserId)?.user;
      if (found) {
        setSelectedUser(found);
        return;
      }

      // Otherwise fetch directly
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", toUserId)
        .single();

      if (error) console.error("Error fetching toUser:", error);
      if (data) setSelectedUser(data);
    };

    ensureSelectedUser();
  }, [toUserId, chatUsers]);

  console.log(toUserId, "toUserId");

  return (
    <div className="flex   justify-center bg-gradient-to-b from-black via-gray-900 to-black text-white h-[calc(100vh-110px)] ">
      <div className="flex flex-1 overflow-hidden justify-between">
        {/* Sidebar */}
        <aside className="w-100 border-r border-gray-800 bg-gray-900 flex flex-col">
          <h2 className="px-4 py-3 font-bold text-lg border-b border-gray-800">
            Chats
          </h2>
          <div className="flex-1 overflow-y-auto">
            {chatUsers.map((chat) => (
              <div
                key={chat.user.id}
                className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-800 transition ${
                  params.userId?.includes(chat.user.id) ? "bg-gray-800" : ""
                }`}
                onClick={() =>
                  router.replace(`/messages/${firstId},${chat.user.id}`, {
                    scroll: false,
                  })
                }
              >
                <div className="w-12 h-12 relative rounded-full overflow-hidden flex-shrink-0">
                  {chat.user.avatar_url ? (
                    <Image
                      src={chat.user.avatar_url}
                      alt={chat.user.display_name || "User avatar"}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-4xl font-bold text-white">
                      {chat.user.display_name?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">{chat.user.display_name}</span>
                  <span className="text-sm text-gray-400 truncate max-w-[150px]">
                    {chat.lastMessage}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Main chat area */}
        <main className="px-6 md:px-12 pt-4 max-w-6xl   w-full">
          <div className="bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white max-w-5xl mx-auto p-6 rounded-2xl shadow-2xl flex flex-col h-full">
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto space-y-6 pr-2 hide-scrollbar"
            >
              {messages.length > 0 ? (
                <>
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex items-end space-x-2 ${
                        msg.from_user.id === fromUserId
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      {msg.from_user.id !== fromUserId && (
                        <div
                          className="w-14 h-14 relative flex-shrink-0 cursor-pointer overflow-hidden rounded-full transition-transform duration-200 hover:scale-110"
                          onClick={() =>
                            router.push(`/user/${msg.from_user.id}`)
                          }
                        >
                          {msg.from_user.avatar_url ? (
                            <Image
                              src={msg.from_user.avatar_url}
                              alt={msg.from_user.display_name || "User avatar"}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-4xl font-bold text-white">
                              {msg.from_user.display_name?.[0]?.toUpperCase() ||
                                "U"}
                            </div>
                          )}
                        </div>
                      )}

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

                      {msg.from_user.id === fromUserId && (
                        <div className="w-14 h-14 relative flex-shrink-0 cursor-pointer overflow-hidden rounded-full transition-transform duration-200 hover:scale-110">
                          <Image
                            src={
                              msg.from_user.avatar_url || "/default-avatar.png"
                            }
                            alt={msg.from_user.display_name || "User"}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </>
              ) : (
                <div className="text-center text-gray-400 text-lg">
                  {!toUserId ? (
                    <>
                      <p>💬 No chat selected</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Select a chat from the sidebar to start messaging
                      </p>
                    </>
                  ) : messages.length === 0 ? (
                    <>
                      <p>No messages yet 👋</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Start the conversation below!
                      </p>
                    </>
                  ) : null}
                </div>
              )}
            </div>

            {/* Input */}
            <div className="mt-4   w-full justify-center items-center mx-auto flex space-x-2">
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
        {/* Right Sidebar - User Details */}
        {toUserId && (
          <aside className="w-100 border-l border-gray-800 bg-gray-900 flex flex-col p-6">
            {toUserId ? (
              selectedUser ? (
                <div className="flex flex-col items-center space-y-5">
                  {/* Avatar with glow */}
                  <div className="w-32 h-32 relative rounded-full overflow-hidden border-4 border-blue-500 shadow-lg ring-2 ring-blue-400">
                    {selectedUser.avatar_url ? (
                      <Image
                        src={selectedUser.avatar_url}
                        alt={selectedUser.display_name || "User avatar"}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-6xl font-bold text-white">
                        {selectedUser.display_name?.[0]?.toUpperCase() || "U"}
                      </div>
                    )}
                  </div>

                  {/* Name & Role */}
                  <div className="text-center space-y-1">
                    <h2 className="text-2xl font-bold text-white">
                      {selectedUser.display_name || "N/A"}
                    </h2>
                    <p className="text-gray-400 text-sm">
                      {selectedUser.role_title || "N/A"}
                    </p>
                    <p className="text-gray-300 text-xs">
                      {selectedUser.experience_level || "N/A"}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {selectedUser.location || "N/A"}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {selectedUser.availability || "N/A"}
                    </p>
                  </div>

                  {/* Bio */}
                  <div className="bg-gray-800/50 p-4 rounded-xl shadow w-full text-center">
                    <h3 className="font-semibold text-lg mb-2">Bio</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {selectedUser.bio || "No bio available."}
                    </p>
                  </div>

                  {/* Skills */}
                  <div className="text-center w-full">
                    <h3 className="font-semibold text-lg mb-2">Skills</h3>
                    {selectedUser.skills && selectedUser.skills.length > 0 ? (
                      <div className="flex flex-wrap justify-center gap-2">
                        {selectedUser.skills.map((skill) => (
                          <span
                            key={skill}
                            className="px-3 py-1 bg-gray-700 rounded-full text-sm text-gray-200"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-sm">No skills added.</p>
                    )}
                  </div>

                  {/* Links */}
                  <div className="flex gap-4 flex-wrap justify-center text-sm text-gray-300">
                    {selectedUser.website_url && (
                      <a
                        href={selectedUser.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-white"
                      >
                        🌐 Website
                      </a>
                    )}
                    {selectedUser.github_url && (
                      <a
                        href={selectedUser.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-white"
                      >
                        💻 GitHub
                      </a>
                    )}
                    {selectedUser.linkedin_url && (
                      <a
                        href={selectedUser.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-white"
                      >
                        🔗 LinkedIn
                      </a>
                    )}
                    {selectedUser.dribbble_url && (
                      <a
                        href={selectedUser.dribbble_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-white"
                      >
                        🎨 Dribbble
                      </a>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 text-center w-full mt-2">
                    <div className="bg-gray-800/50 p-3 rounded-lg shadow">
                      <p className="text-xl font-semibold">
                        {selectedUser.followers_count}
                      </p>
                      <p className="text-gray-400 text-sm">Followers</p>
                    </div>
                    <div className="bg-gray-800/50 p-3 rounded-lg shadow">
                      <p className="text-xl font-semibold">
                        {selectedUser.following_count}
                      </p>
                      <p className="text-gray-400 text-sm">Following</p>
                    </div>
                  </div>

                  {/* Contact */}
                  {selectedUser.phone_number && (
                    <p className="text-gray-400 text-sm mt-1">
                      📞 {selectedUser.phone_number}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-center mt-20">
                  Loading user details...
                </p>
              )
            ) : (
              <p className="text-gray-500 text-center mt-20">
                Select a chat to view user details
              </p>
            )}
          </aside>
        )}
      </div>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50 pointer-events-none">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-200 mt-4">Loading chat...</p>
          </div>
        </div>
      )}
    </div>
  );
}
