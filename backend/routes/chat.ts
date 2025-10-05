import express from "express"
import Groq from "groq-sdk";
import {Interaction} from "../db/model.ts";
import Authmiddleware from "./middleware.ts";
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const router=express.Router()
export default router.post("/newchat",Authmiddleware,async(req,res,next)=>{
    const {prompt}=req.body;
    const ans= await getGroqChatCompletion(prompt);
    const response=ans.choices[0].message.content;
    const interaction=new Interaction({prompt,response})
    await interaction.save();
    return res.json({
        response,prompt
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