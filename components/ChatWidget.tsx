"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";

interface Message {
  id: string;
  senderType: string;
  senderName: string;
  content: string;
  createdAt: string;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [guestId, setGuestId] = useState<string | null>(null);
  const [guestName, setGuestName] = useState("");
  const [showNameInput, setShowNameInput] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Get or create guest ID from localStorage
  useEffect(() => {
    const storedGuestId = localStorage.getItem("chat_guest_id");
    const storedGuestName = localStorage.getItem("chat_guest_name");
    
    if (storedGuestId) {
      setGuestId(storedGuestId);
    } else {
      const newGuestId = uuidv4();
      localStorage.setItem("chat_guest_id", newGuestId);
      setGuestId(newGuestId);
    }

    if (storedGuestName) {
      setGuestName(storedGuestName);
      setShowNameInput(false);
    }
  }, []);

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    if (!guestId) return;
    
    try {
      const res = await fetch(`/api/chat/messages?guestId=${guestId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }, [guestId]);

  // Poll for new messages when chat is open
  useEffect(() => {
    if (isOpen && guestId && !showNameInput) {
      fetchMessages();
      pollInterval.current = setInterval(fetchMessages, 3000);
    }

    return () => {
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
      }
    };
  }, [isOpen, guestId, showNameInput, fetchMessages]);

  const handleStartChat = async () => {
    if (!guestName.trim()) return;
    
    localStorage.setItem("chat_guest_name", guestName);
    setShowNameInput(false);

    // Create chat session
    try {
      await fetch("/api/chat/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestId, guestName }),
      });
      fetchMessages();
    } catch (error) {
      console.error("Error creating chat session:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isLoading || !guestId) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestId,
          guestName,
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
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chat button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all duration-300 flex items-center justify-center group",
          isOpen && "scale-0 opacity-0"
        )}
      >
        <MessageCircle className="w-7 h-7 group-hover:scale-110 transition-transform" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent-500 rounded-full animate-pulse" />
      </button>

      {/* Chat window */}
      <div
        className={cn(
          "fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl shadow-slate-300/50 transition-all duration-300 overflow-hidden",
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">Chat với chúng tôi</h3>
                <p className="text-sm text-primary-100">Hỗ trợ trực tuyến 24/7</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        {showNameInput ? (
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="font-display text-xl font-semibold text-slate-900 mb-2">
                Xin chào! 👋
              </h3>
              <p className="text-slate-600">
                Vui lòng cho biết tên của bạn để bắt đầu chat
              </p>
            </div>
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Nhập tên của bạn..."
              className="input mb-4"
              onKeyDown={(e) => e.key === "Enter" && handleStartChat()}
            />
            <button
              onClick={handleStartChat}
              disabled={!guestName.trim()}
              className="btn btn-primary w-full"
            >
              Bắt đầu chat
            </button>
          </div>
        ) : (
          <>
            {/* Messages */}
            <div className="h-80 overflow-y-auto p-4 space-y-4 bg-slate-50">
              {messages.length === 0 ? (
                <div className="text-center text-slate-500 py-8">
                  <p className="mb-2">Xin chào {guestName}!</p>
                  <p className="text-sm">Hãy gửi tin nhắn để được hỗ trợ</p>
                </div>
              ) : (
                messages.map((msg) => (
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
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
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
                  disabled={isLoading || !newMessage.trim()}
                  className="btn btn-primary px-4"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

