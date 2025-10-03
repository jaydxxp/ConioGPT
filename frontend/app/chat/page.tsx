"use client";

import { ChatInput, ChatInputSubmit, ChatInputTextArea } from "@/components/ui/chat-input";
import axios from "axios";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css"; 
import remarkGfm from "remark-gfm";

interface BackendResponse {
  response: string;
}
export default function Chat() {
  const [value, setValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<BackendResponse | null>(null);

  const handleSubmit = () => {
    setIsLoading(true);

    axios
      .post(process.env.NEXT_PUBLIC_BackendURL || "", { prompt: value })
      .then((res) => setResponse(res.data))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  };

  return (
	
    <div className="w-full h-full flex justify-center items-center flex-col gap-3">
		<div className="flex justify-start text-2xl font-mono text-amber-50 ">CONIOGPT</div>
      <div className=" text-white w-170 h-150 rounded-2xl p-4 overflow-auto border border-amber-100 ">
        <p className="bg-black border-1 rounded-2xl p-2 w-auto">{value}</p>
        <div className="bg-stone-500 border-1 rounded-2xl p-2 w-auto">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
          {response?.response || ""}
        </ReactMarkdown>
        </div>
        
      </div>

      <ChatInput
        variant="default"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onSubmit={handleSubmit}
        loading={isLoading}
        onStop={() => setIsLoading(false)}
      >
        <ChatInputTextArea placeholder="Type a message..." />
        <ChatInputSubmit />
      </ChatInput>
    </div>
  );
}
