import express from "express";
import axios from "axios";
import jwt from "jsonwebtoken";
import qs from "querystring";
import { User } from "../db/model"; 

const GoogleRouter = express.Router();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI! ;
const FRONTEND_URL = process.env.FRONTEND_URL!;
const JWT_SECRET = process.env.JWT_SECRET || process.env.JWT!;

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
  id_token: string;
}

interface GoogleUserInfo {
  email: string;
  name?: string;
  picture?: string;
  sub: string; 
  email_verified?: boolean;
}


GoogleRouter.get("/google", (req, res) => {
  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  const options = {
    redirect_uri: REDIRECT_URI,
    client_id: GOOGLE_CLIENT_ID,
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
    scope: ["https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email"].join(" "),
  };

  const queryString = new URLSearchParams(options).toString();
  res.redirect(`${rootUrl}?${queryString}`);
});


GoogleRouter.get("/google/callback", async (req, res) => {
  const code = req.query.code as string;

  if (!code) {
    return res.redirect(`${FRONTEND_URL}/login?error=no_code`);
  }

  try {

    const { data } = await axios.post<GoogleTokenResponse>(
      "https://oauth2.googleapis.com/token",
      qs.stringify({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const { access_token, id_token } = data;


    const userInfo = JSON.parse(
      Buffer.from(id_token.split(".")[1], "base64").toString()
    ) as GoogleUserInfo;

    console.log("Google User Info:", userInfo);


    let user = await User.findOne({ googleid: userInfo.sub });

    if (!user) {
   
      user = await User.findOne({ email: userInfo.email });

      if (user) {
    
        user.googleid = userInfo.sub;
        if (!user.name && userInfo.name) {
          user.name = userInfo.name;
        }
        await user.save();
      } else {
  
        user = await User.create({
          googleid: userInfo.sub,
          name: userInfo.name || "Google User",
          email: userInfo.email,
          username: userInfo.email.split('@')[0] || `user_${userInfo.sub}`,

        });
      }
    }



    const token = jwt.sign(
      {
        userid: user._id.toString(),   
        userId: user._id.toString(),   
        email: user.email,
        username: user.username
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );


    const redirectUrl = `${FRONTEND_URL.replace(/\/+$/, "")}/auth/google/success?token=${encodeURIComponent(token)}`;
    return res.redirect(redirectUrl);
  } catch (err: any) {
    console.error("Google OAuth Error:", err.response?.data || err.message);
    res.redirect(`${FRONTEND_URL}/login?error=auth_failed`);
  }
});

GoogleRouter.get("/profile", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      googleid: user.googleid,
    });
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});

export { GoogleRouter };