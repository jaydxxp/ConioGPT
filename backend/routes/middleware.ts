// ...existing code...
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config()

export default function Authmiddleware(req: any, res: any, next: any) {
  const authheader = req.headers.authorization || (req.headers as any).Authorization;
  console.log("AUTH HEADER RECEIVED:", authheader);
  if (!authheader) {
    return res.status(401).json({ message: "NO Token Found" });
  }


  const token = authheader.startsWith("Bearer ") ? authheader.split(" ")[1] : authheader;

  try {
    const decoded: any = jwt.verify(token, process.env.JWT);

    req.userid = decoded.userid ?? decoded.userId;
    next();
  } catch (e) {
    console.error("Auth verify error:", e);
    return res.status(403).json({ message: "Invalid token" });
  }
}
