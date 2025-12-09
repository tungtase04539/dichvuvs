"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  MessageCircle,
  Send,
  User,
  Clock,
  Loader2,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  senderType: string;
  senderName: string;
  content: string;
  createdAt: string;
}

interface ChatSession {
  id: string;
  guestId: string;
  guestName: string | null;
  guestPhone: string | null;
  status: string;
  lastActivity: string;
  messages: Message[];
}

export default function AdminChatPage() {
  const searchParams = useSearchParams();
  const initialSessionId = searchParams.get("session");
  
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(initialSessionId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch all chat sessions
  const fetchSessions = async () => {
    try {
      const res = await fetch("/api/chat/sessions");
      const data = await res.json();
      setSessions(data.sessions || []);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch messages for selected session
  const fetchMessages = useCallback(async () => {
    if (!selectedSession) return;

    try {
      const res = await fetch(`/api/chat/messages?sessionId=${selectedSession}`);
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }, [selectedSession]);

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (selectedSession) {
      fetchMessages();
      // Poll for new messages
      pollInterval.current = setInterval(fetchMessages, 3000);
    }

    return () => {
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
      }
    };
  }, [selectedSession, fetchMessages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedSession || isSending) return;

    setIsSending(true);
    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: selectedSession,
          content: newMessage,
        }),
      });

      if (res.ok) {
        setNewMessage("");
        fetchMessages();
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleCloseSession = async (sessionId: string) => {
    try {
      await fetch(`/api/chat/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "closed" }),
      });
      fetchSessions();
      if (selectedSession === sessionId) {
        setSelectedSession(null);
        setMessages([]);
      }
    } catch (error) {
      console.error("Error closing session:", error);
    }
  };

  const selectedSessionData = sessions.find((s) => s.id === selectedSession);

  return (
    <div className="h-[calc(100vh-180px)] flex gap-6">
      {/* Sessions list */}
      <div className="w-80 bg-white rounded-2xl shadow-sm flex flex-col">
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Cuộc hội thoại</h2>
            <button
              onClick={fetchSessions}
              className="p-2 rounded-lg hover:bg-slate-100"
            >
              <RefreshCw className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-10">
              <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500">Chưa có cuộc hội thoại nào</p>
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => setSelectedSession(session.id)}
                className={cn(
                  "p-4 border-b border-slate-50 cursor-pointer transition-colors",
                  selectedSession === session.id
                    ? "bg-primary-50"
                    : "hover:bg-slate-50"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold">
                    {(session.guestName || "K").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-slate-900 truncate">
                        {session.guestName || "Khách"}
                      </p>
                      {session.status === "active" && (
                        <span className="w-2 h-2 bg-green-500 rounded-full" />
                      )}
                    </div>
                    {session.guestPhone && (
                      <p className="text-xs text-slate-500">{session.guestPhone}</p>
                    )}
                    <p className="text-sm text-slate-500 truncate mt-1">
                      {session.messages?.[0]?.content || "Chưa có tin nhắn"}
                    </p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
                      <Clock className="w-3 h-3" />
                      {new Date(session.lastActivity).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm flex flex-col">
        {selectedSession && selectedSessionData ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold">
                    {(selectedSessionData.guestName || "K").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">
                      {selectedSessionData.guestName || "Khách"}
                    </p>
                    <p className="text-sm text-slate-500">
                      {selectedSessionData.guestPhone || "Chưa có SĐT"}
                    </p>
                  </div>
                </div>
                {selectedSessionData.status === "active" && (
                  <button
                    onClick={() => handleCloseSession(selectedSession)}
                    className="btn btn-ghost text-red-600 hover:bg-red-50"
                  >
                    <XCircle className="w-4 h-4" />
                    Đóng hội thoại
                  </button>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex",
                    msg.senderType === "guest" ? "justify-start" : "justify-end"
                  )}
                >
                  <div
                    className={cn(
                      "chat-bubble",
                      msg.senderType === "guest"
                        ? "chat-bubble-guest"
                        : "chat-bubble-staff"
                    )}
                  >
                    {msg.senderType !== "guest" && (
                      <p className="text-xs opacity-75 mb-1">{msg.senderName}</p>
                    )}
                    <p>{msg.content}</p>
                    <p className="text-xs opacity-50 mt-1">
                      {new Date(msg.createdAt).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            {selectedSessionData.status === "active" ? (
              <div className="p-4 border-t border-slate-100">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Nhập tin nhắn..."
                    className="input flex-1"
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={isSending || !newMessage.trim()}
                    className="btn btn-primary px-4"
                  >
                    {isSending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 border-t border-slate-100 text-center text-slate-500">
                Cuộc hội thoại đã đóng
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Chọn một cuộc hội thoại để bắt đầu</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

