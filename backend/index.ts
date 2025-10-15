import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import Groq from "groq-sdk";
import mongoose from "mongoose";
import Chatrouter from "./routes/chat.ts"
import Authrouter from "./routes/index.ts"
import Authmiddleware from "./routes/middleware.ts";
dotenv.config();
const app=express();
app.use(express.json());
app.use(cors());
mongoose.connect(process.env.DBURL!)
.then(()=>console.log("Mongoose Connected"))
.catch((e)=>console.log(e))
app.use("/",Chatrouter)
app.use("/api",Authrouter)
const PORT = Number(process.env.PORT) || 3030; 
app.listen(PORT, "0.0.0.0", () =>
  console.log(`Server running on port ${PORT}`)
);

