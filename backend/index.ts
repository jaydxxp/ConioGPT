import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import Groq from "groq-sdk";
dotenv.config();
const app=express();
app.use(express.json());
app.use(cors());
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
app.post("/chat",async(req,res)=>{
    const {prompt}=req.body;
    const ans= await getGroqChatCompletion(prompt);
    const response=ans.choices[0].message.content;
    res.json({
        response
    })
})

export async function getGroqChatCompletion(prompt) {
  console.log("called!")
  return groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content:prompt,
      },
    ],
    model: "llama-3.1-8b-instant",
  });
}
app.listen(3030)
