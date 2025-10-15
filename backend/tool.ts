
import dotenv from "dotenv";
import { tavily } from "@tavily/core";

dotenv.config();

export const check = async ({ query }: { query: string }) => {
  console.log("Tool calling with query:", query);
  
  try {
    const tvly = tavily({ apiKey: process.env.TAVILY_API! });
    const response = await tvly.search(query, {
      max_results: 5,
      include_answer: true
    });
    
    console.log("Tavily response:", response);
    return response;
  } catch (error) {
    console.error("Tavily search error:", error);
    throw error;
  }
};