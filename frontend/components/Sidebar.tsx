"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const BASE_URL = process.env.NEXT_PUBLIC_BackendURL?.replace(/\/?$/, "") ?? "https://backend-n70l.onrender.com";

  const isValidObjectId = (id?: string | null) =>
    typeof id === "string" && /^[0-9a-fA-F]{24}$/.test(id);

  const getAuthHeader = () => {
    const raw = localStorage.getItem("token") || "";
    const token = raw.startsWith("Bearer ") ? raw.split(" ")[1] : raw;
    return token ? `Bearer ${token}` : "";
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  
  const fetchChats = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return; 
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/chats`, {
        headers: { Authorization: getAuthHeader() },
      });
      setChats(res?.data?.chats || []);
    } catch (err: any) {
      console.error("Failed to fetch chats", err);
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        localStorage.removeItem("token");
        router.push("/auth/signin");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  const handleNewChat = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/auth/signin"); 
        return;
      }

      const res = await axios.post(
        `${BASE_URL}/chat`,
        { prompt: "" },
        { headers: { Authorization: getAuthHeader() } }
      );
      const newChatId = res?.data?.chatId;
      await fetchChats();
      if (isValidObjectId(newChatId)) {
        router.push(`/chat?id=${encodeURIComponent(newChatId)}`);
      }
    } catch (err: any) {
      console.error("Failed to create chat", err);
    } finally {
      setLoading(false);
      setSidebarOpen(false);
    }
  };

  const handleOpenChat = (id?: string | null) => {

    if (!id || id === "undefined" || id === "null" || !isValidObjectId(id)) {
      console.warn("Attempted to open chat with invalid id:", id);
      return;
    }
    router.push(`/chat?id=${encodeURIComponent(id)}`);
    setSidebarOpen(false);
  };

  return (
    <div>
{ !sidebarOpen &&
   <div className="fixed top-4 left-4 z-50 hover:bg-stone-900 p-3 rounded-lg">
        <button onClick={toggleSidebar} className="cursor-pointer">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="#C4C7C9"
            width="20px"
            height="20px"
            viewBox="0 0 24.75 24.75"
          >
            <path d="M0,3.875c0-1.104,0.896-2,2-2h20.75c1.104,0,2,0.896,2,2s-0.896,2-2,2H2C0.896,5.875,0,4.979,0,3.875z M22.75,10.375H2c-1.104,0-2,0.896-2,2 c0,1.104,0.896,2,2,2h20.75c1.104,0,2-0.896,2-2C24.75,11.271,23.855,10.375,22.75,10.375z M22.75,18.875H2c-1.104,0-2,0.896-2,2 s0.896,2,2,2h20.75c1.104,0,2-0.896,2-2S23.855,18.875,22.75,18.875z" />
          </svg>
        </button>
      </div>
}
     


      <div
        className={`fixed top-0 left-0 h-full w-64 bg-zinc-900 text-white transform
        transition-transform duration-300 ease-in-out z-50
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <span className="text-lg font-bold">Chat History</span>
          <button
            className="text-white text-xl font-bold"
            onClick={() => setSidebarOpen(false)}
          >
            ✕
          </button>
        </div>

        
        <div className="p-4 border-b border-gray-700">
          <button
            onClick={handleNewChat}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition-colors"
          >
            + New Chat
          </button>
        </div>

        <div className="overflow-y-auto h-[calc(100%-130px)] p-3 space-y-2">
          {loading && <div className="text-gray-400 text-sm">Loading...</div>}
          {!loading && chats.length === 0 && (
            <div className="text-gray-500 text-sm">No chats yet</div>
          )}

          {chats.map((chat: any) => (
            <button
              key={chat.id}
              onClick={() => handleOpenChat(chat.id)}
              className="w-full text-left bg-zinc-800 hover:bg-zinc-700 rounded-lg p-3 text-sm transition-colors"
            >
              <div className="font-semibold truncate">
                {chat.title || "New Chat"}
              </div>
              {chat.lastMessage?.content && (
                <div className="text-xs text-gray-400 truncate">
                  {chat.lastMessage.content}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
