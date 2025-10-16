import express from "express";
import Groq from "groq-sdk";
import mongoose from "mongoose"; 
import { User, Chat, Message } from "../db/model";
import type { IChatPopulatedLean, IUser } from "../db/model"
import Authmiddleware from "./middleware";
import { check } from "../tool";

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
          content: `You are a smart social media assistant.

If you know the answer to a question, answer it directly in plain English.

If the answer requires real-time trends, local content, or up-to-date social media information, use the Tool function to search for it.

When using the Tool function, you MUST provide ONLY the query parameter in this exact format:
{"query": "your search query here"}

Do NOT include any other fields like "name" or "description" in the tool call.

Focus on helping with tasks like:
- Generating captions, hashtags, or post ideas
- Finding trending songs, memes, or challenges
- Suggesting posting times or strategies based on trends
- Recommending tools, apps, or platforms for social media growth

Examples of CORRECT tool usage:
User: "What are trending songs on TikTok?"
Tool call: {"query": "trending TikTok songs 2025"}

User: "Latest Instagram trends?"
Tool call: {"query": "Instagram trends October 2025"}

Examples of when to answer directly (no tool needed):
Q: What's a catchy Instagram caption for a beach photo?
A: "Sandy toes, sun-kissed nose 🌊☀️"

Q: When is the best time to post on LinkedIn?
A: Generally, Tuesday to Thursday mornings (8–10 AM) tend to get higher engagement.

Q: Suggest some hashtags for a fitness post on Instagram.
A: #FitnessMotivation #WorkoutGoals #HealthyLifestyle #FitLife #GymTime`,
        },
        ...conversation,
      ] as ChatCompletionMessageParam[],
      tools: [
        {
          type: "function",
          function: {
            name: "Tool",
            description: "Search the web for latest trends or real-time data. Call this function with ONLY a query parameter.",
            parameters: {
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description: "Search query for finding current trends, news, or real-time information",
                },
              },
              required: ["query"],
              additionalProperties: false,
            },
          },
        },
      ],
      tool_choice: "auto",
    });

    let responseText = ans.choices[0].message?.content || "";
    const toolCalls = ans.choices[0].message?.tool_calls;

    // Handle tool calls if present
    if (toolCalls && toolCalls.length > 0) {
      const toolResults = [];
      
      for (const toolCall of toolCalls) {
        if (toolCall.function.name === "Tool") {
          try {
            const args = JSON.parse(toolCall.function.arguments);
            const searchQuery = args.query;
            
            // Call your search function with the correct parameter format
            const searchResult = await check({
              query: searchQuery
            } as any);
            
            toolResults.push({
              role: "tool",
              content: JSON.stringify(searchResult),
              tool_call_id: toolCall.id,
            });
          } catch (error) {
            console.error("Tool execution error:", error);
            toolResults.push({
              role: "tool",
              content: JSON.stringify({ error: "Search failed" }),
              tool_call_id: toolCall.id,
            });
          }
        }
      }

      // Get final response with tool results
      if (toolResults.length > 0) {
        const followUp = await groq.chat.completions.create({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "system",
              content: `You are a smart social media assistant. Use the search results to provide helpful, accurate answers about current trends.`,
            },
            ...conversation,
            ans.choices[0].message,
            ...toolResults,
          ] as any,
        });

        responseText = followUp.choices[0].message?.content || "No content generated.";
      }
    }

    if (!responseText) {
      responseText = "No content generated.";
    }

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
        content: "You are a Social Media Marketing assistant. When you need real-time or recent information, use the Tool function with ONLY a query parameter in format: {\"query\": \"your search here\"}. Do NOT include name or description fields."
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
          description: "Search the web for latest information and real-time data.",
          parameters: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "The search query to perform the web search"
              }
            },
            required: ["query"],
            additionalProperties: false
          }
        }
      }
    ],
    tool_choice: "auto"
  });
}

export default router;