import ChatClient from "@/components/ChatCient";
import { Suspense } from "react";


export default function ChatPage() {
  return (
    <Suspense fallback={<div className="text-white p-6">Loading chat...</div>}>
      <ChatClient />
    </Suspense>
  );
}
