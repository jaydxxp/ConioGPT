"use client";
import { ChatInput, ChatInputSubmit, ChatInputTextArea } from "@/components/ui/chat-input";
import axios from "axios";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { NavbarDemo } from "@/components/Navbar";
import { VoiceButton } from "@/components/Voice";
import { Logbar } from "@/components/Logbar";


interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Chat() {
  const [value, setValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const handleSubmit = () => {
    if (!value.trim()) return;

    const newMessage: Message = { role: "user", content: value };
    setMessages((prev) => [...prev, newMessage]);
    setIsLoading(true);

    axios
      .post(
        process.env.NEXT_PUBLIC_BackendURL + "chat/newchat" || "",
        { prompt: value },
        { headers: { Authorization: `${localStorage.getItem("token")}` } }
      )
      .then((res) => {
        const assistantMessage: Message = {
          role: "assistant",
          content: res.data.response,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      })
      .catch((err) =>{if (err.response?.status === 403) {
    localStorage.removeItem("token");
    window.location.href = "http://localhost:3000/auth/signin";
  } })
      .finally(() => {
        setIsLoading(false);
        setValue("");
      });
  };


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="h-min-screen">
        
    <div className="relative flex flex-col min-h-screen bg-black">
      <BackgroundBeams/>
      <Logbar/>
      <div className="flex flex-col flex-1 items-center w-full overflow-hidden">

        <div className="flex-1 w-full max-w-3xl overflow-y-auto px-4 py-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex w-full ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-3 font-sans text-sm leading-relaxed break-words ${
                  msg.role === "user"
                    ? "bg-blue-500 text-white self-end"
                    : "bg-stone-700 text-white border border-stone-600"
                }`}
              >
                {msg.role === "assistant" ? (
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
            <ChatInputTextArea placeholder="Ask anything" />
            <VoiceButton value={value} setValue={setValue} />
            <ChatInputSubmit />
          </ChatInput>
        </div>
      </div>
          
    </div>
  
    </div>
  );
}
