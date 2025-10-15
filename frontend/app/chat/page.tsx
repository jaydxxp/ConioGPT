"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import {
  ChatInput,
  ChatInputSubmit,
  ChatInputTextArea,
} from "@/components/ui/chat-input";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { Logbar } from "@/components/Logbar";
import { VoiceButton } from "@/components/Voice";
import Sidebar from "@/components/Sidebar";

interface Message {
  sender: "user" | "assistant";
  content: string;
}

export default function Chat() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawId = searchParams.get("id");
  const chatId =
    rawId && rawId !== "undefined" && rawId !== "null" ? rawId : null;

  const [value, setValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const BASE_URL =
    process.env.NEXT_PUBLIC_BackendURL?.replace(/\/?$/, "") ?? "http://localhost:3030";


  const getAuthHeader = () => {
    const raw = (typeof window !== "undefined" && localStorage.getItem("token")) || "";
    const token = raw.startsWith("Bearer ") ? raw.split(" ")[1] : raw;
    return token ? `Bearer ${token}` : "";
  };

  const isValidObjectId = (id: string | null | undefined) =>
    typeof id === "string" && /^[0-9a-fA-F]{24}$/.test(id);


  const fetchMessages = async (id: string) => {
    if (!id || !isValidObjectId(id)) {
      setMessages([]);
      return;
    }

    try {
      setIsLoading(true);
      setMessages([]);
      const res = await axios.get(`${BASE_URL}/chat/${id}`, {
        headers: { Authorization: getAuthHeader() },
      });

      if (res?.data?.chat?.messages) {
        const msgs: Message[] = res.data.chat.messages.map((m: any) => ({
          sender: m.sender === "assistant" ? "assistant" : "user",
          content: m.content,
        }));
        setMessages(msgs);
      } else {
        setMessages([]);
      }
    } catch (err: any) {
      console.error("Error fetching chat:", err);
      if (err?.response?.status === 403 || err?.response?.status === 401) {
        localStorage.removeItem("token");
        router.push("/auth/signin");
      }
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  
  useEffect(() => {

    if (chatId && isValidObjectId(chatId)) {
      fetchMessages(chatId);
    } else {
      setMessages([]);
    }

  }, [chatId]);


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);


  const handleSubmit = async () => {
    if (!value.trim()) return;
    setIsLoading(true);
    
    setMessages((prev) => [...prev, { sender: "user", content: value }]);
    try {

      const url = chatId && isValidObjectId(chatId) ? `${BASE_URL}/chat?id=${chatId}` : `${BASE_URL}/chat`;
      const res = await axios.post(url, { prompt: value }, { headers: { Authorization: getAuthHeader()}});

      const returnedChatId = res?.data?.chatId;
      const assistantText = res?.data?.response ?? "";

    
      setMessages((prev) => [...prev, { sender: "assistant", content: assistantText }]);

      
      if (!chatId && returnedChatId) {

        router.push(`/chat?id=${returnedChatId}`);
      } else if (chatId) {
     
        await fetchMessages(chatId);
      }
    } catch (err: any) {
      if (err?.response?.status === 403) {
        localStorage.removeItem("token");
        window.location.href = "/auth/signin";
      } else {
        console.error("Failed to send message", err);
      }
    } finally {
      setIsLoading(false);
      setValue("");
    }
  };

  return (
    <div className="relative flex flex-1 flex-col min-h-screen bg-black text-white">
      <BackgroundBeams />
      <Sidebar/>
      <Logbar />

      <div className="flex-1 flex flex-col items-center w-full overflow-hidden">
        <div className="flex-1 w-full max-w-3xl overflow-y-auto px-4 py-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex w-full ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-3 font-sans text-sm leading-relaxed break-words ${
                  msg.sender === "user" ? "bg-blue-500 text-white" : "bg-stone-700 text-white border border-stone-600"
                }`}
              >
                {msg.sender === "assistant" ? (
                  <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                    {msg.content}
                  </ReactMarkdown>
                ) : (
                  <p>{msg.content}</p>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-stone-700 text-white border border-stone-600 rounded-2xl px-4 py-2 animate-pulse">
                Thinking...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="w-full max-w-3xl px-4 py-3 border-t border-gray-800 bg-black/70 backdrop-blur-md sticky bottom-0">
          <ChatInput
            variant="default"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onSubmit={handleSubmit}
            loading={isLoading}
            onStop={() => setIsLoading(false)}
          >
            <ChatInputTextArea placeholder="Ask anything..." />
            <VoiceButton value={value} setValue={setValue} />
            <ChatInputSubmit />
          </ChatInput>
        </div>
      </div>
    </div>
  );
}
