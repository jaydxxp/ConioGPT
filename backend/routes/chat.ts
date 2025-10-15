import express from "express";
import Groq from "groq-sdk";
import mongoose from "mongoose"; 
import { User,Chat,Message } from "../db/model.ts";
import type {IChatPopulatedLean, IUser} from "../db/model.ts"
import Authmiddleware from "./middleware.ts";
import { check } from "../tool.ts";


const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const router = express.Router();
declare module "express-serve-static-core" {
  interface Request {
    user?: IUser;
  }
}
type ChatCompletionMessageParam =
  | { role: "system"; content: string }
  | { role: "user"; content: string }
  | { role: "assistant"; content: string }
  | { role: "function"; name: string; content: string }
  | { role: "tool"; content: string; tool_call_id: string }

router.post("/chat", Authmiddleware, async (req, res) => {
  try {
    const { prompt } = req.body || {};

    if (!req.user) return res.status(401).json({ error: "Unauthorized" });


    if (!prompt || prompt === "__new_chat__") {
      const chat = await Chat.create({ user: req.user._id, title: "New Chat" });
      return res.status(201).json({ chatId: chat._id, chat });
    }

    const rawId = req.query.id;
    let chatId: string | undefined;
    if (typeof rawId === "string" && mongoose.isValidObjectId(rawId)) {
      chatId = rawId;
    }

    const userId = req.user._id;
    let chat;


    if (chatId) {
      chat = await Chat.findById(chatId);
      if (!chat) return res.status(404).json({ error: "Chat not found" });
    } else {
      chat = await Chat.create({ user: userId, title: "New Chat" });
    }


    const previousMessages = await Message.find({ chat: chat._id })
      .sort({ createdAt: 1 })
      .select("sender content")
      .lean();

    const conversation = previousMessages.map((msg) => ({
      role: msg.sender === "user" ? "user" : "assistant",
      content: msg.content,
    }));


    conversation.push({ role: "user", content: prompt });


    const ans = await groq.chat.completions.create({
  model: "llama-3.1-8b-instant",
  messages: [
    {
      role: "system",
      content:
        "You are a helpful social media marketing assistant. Remember details shared by the user within this chat. Be friendly, concise, and professional.",
    },
    ...conversation,
    { role: "user", content: prompt },
  ] as ChatCompletionMessageParam[], 
  tools: [
    {
      type: "function",
      function: {
        name: "Tool",
        description: "Search the web for latest trends or real-time data.",
        parameters: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Search query",
            },
          },
          required: ["query"],
        },
      },
    },
  ],
  tool_choice: "auto",
});

    let responseText = ans.choices[0].message?.content || "No content generated.";


    const userMsg = await Message.create({
      chat: chat._id,
      sender: "user",
      content: prompt,
    });

    const botMsg = await Message.create({
      chat: chat._id,
      sender: "assistant",
      content: responseText,
    });

    await Chat.findByIdAndUpdate(chat._id, {
      $push: { messages: { $each: [userMsg._id, botMsg._id] } },
    });


    res.json({
      chatId: chat._id,
      response: responseText,
      prompt,
    });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ error: "Failed to process chat" });
  }
});


router.get("/chats", Authmiddleware, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const chats = await Chat.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select("_id title createdAt messages")
      .populate({
        path: "messages",
        options: { limit: 1, sort: { createdAt: -1 } },
        select: "content sender createdAt"
      })
      .lean() as unknown as IChatPopulatedLean[];  

    const formattedChats = chats.map(chat => {
      const lastMsg = chat.messages.length > 0 ? chat.messages[0] : null;

      return {
        id: chat._id,
        title: chat.title || "New Chat",
        messageCount: chat.messages.length,
        lastMessage: lastMsg ? {
          content: lastMsg.content,
          sender: lastMsg.sender,
          createdAt: lastMsg.createdAt
        } : null,
        createdAt: chat.createdAt
      };
    });

    res.json({
      success: true,
      count: formattedChats.length,
      chats: formattedChats
    });
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).json({ error: "Failed to fetch chats" });
  }
});

router.get("/chat/:id", Authmiddleware, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const paramId = req.params.id;
    if (!mongoose.isValidObjectId(paramId)) {
      return res.status(400).json({ error: "Invalid chat id" });
    }

    const chat = await Chat.findOne({
      _id: paramId,
      user: req.user._id
    })
      .populate({
        path: "messages",
        select: "content sender createdAt",
        options: { sort: { createdAt: 1 } }
      })
      .lean() as IChatPopulatedLean | null;  

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    res.json({
      success: true,
      chat: {
        id: chat._id,
        title: chat.title || "New Chat",
        createdAt: chat.createdAt,
        messages: chat.messages.map(msg => ({
          content: msg.content,
          sender: msg.sender,
          createdAt: msg.createdAt
        }))
      }
    });
  } catch (error) {
    console.error("Error fetching chat:", error);
    res.status(500).json({ error: "Failed to fetch chat" });
  }
});

router.delete("/chat/:id", Authmiddleware, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const chat = await Chat.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    await Message.deleteMany({ chat: chat._id });

    await Chat.findByIdAndDelete(chat._id);

    res.json({
      success: true,
      message: "Chat deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting chat:", error);
    res.status(500).json({ error: "Failed to delete chat" });
  }
});


router.patch("/chat/:id/title", Authmiddleware, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { title } = req.body;

    if (!title || typeof title !== "string") {
      return res.status(400).json({ error: "Valid title is required" });
    }

    const chat = await Chat.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id
      },
      { title: title.trim() },
      { new: true }
    );

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    res.json({
      success: true,
      chat: {
        id: chat._id,
        title: chat.title
      }
    });
  } catch (error) {
    console.error("Error updating chat title:", error);
    res.status(500).json({ error: "Failed to update chat title" });
  }
});
export async function getGroqChatCompletion(prompt: string) {
  console.log("Groq API called!");
  return groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "You are a Social Media Marketing assistant.You are Eligible for mostly Social Media Marketing Stuff suggesting captions and song and all when user asks for current trend you can use trending things on web by tool calling When you need real-time or recent information, use the Tool function to search the web."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    model: "llama-3.1-8b-instant",
    tools: [
      {
        type: "function",
        function: {
          name: "Tool",
          description: "Search the web for latest information and real-time data. Use this when asked about current events, recent news, or information that may have changed.",
          parameters: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "The search query to perform the web search"
              }
            },
            required: ["query"]
          }
        }
      }
    ],
    tool_choice: "auto"
  });
}

export default router;