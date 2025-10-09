
import express from "express";
import Groq from "groq-sdk";
import { Interaction } from "../db/model.ts";
import Authmiddleware from "./middleware.ts";
import { check } from "../tool.ts";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const router = express.Router();

router.post("/newchat", Authmiddleware, async (req, res, next) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const ans = await getGroqChatCompletion(prompt);
    const resdata = ans.choices[0].message;

    if (resdata.tool_calls && resdata.tool_calls.length > 0) {
      for (const tool of resdata.tool_calls) {

        if (tool.function.name === "Tool") {
          const args = JSON.parse(tool.function.arguments);
          console.log("Tool arguments:", args);
          
     
          const toolResult = await check(args);


          const followUp = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
              { role: "user", content: prompt },
              {
                role: "assistant",
                content: null,
                tool_calls: [tool]
              },
              {
                role: "tool",
                tool_call_id: tool.id,
                content: JSON.stringify(toolResult)
              }
            ]
          });

          const finalResponse = followUp.choices[0].message.content;

  
          const interaction = new Interaction({
            prompt,
            response: finalResponse
          });
          await interaction.save();

          return res.json({
            response: finalResponse,
            prompt,
            usedTool: true
          });
        }
      }
    }


    const response = resdata.content || "No response generated";
    
    const interaction = new Interaction({ prompt, response });
    await interaction.save();

    return res.json({
      response,
      prompt,
      usedTool: false
    });
  } catch (error) {
    console.error("Chat error:", error);
    return res.status(500).json({ error: "Failed to process chat" });
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