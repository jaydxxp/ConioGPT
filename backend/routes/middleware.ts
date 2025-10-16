import jwt from "jsonwebtoken";
import { User } from "../db/model";
import type { Request, Response } from "express";
import type { NextFunction } from "express";
const Authmiddleware = async (req:Request, res:Response,next:NextFunction) => {
  try {
    const authHeader = req.headers.authorization || "";
    console.log("AUTH HEADER:", authHeader);
    if (!authHeader) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);


    const userId = decoded?.userid ?? decoded?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Invalid token payload" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(401).json({ error: "Invalid token" });
  }
};

export default Authmiddleware;