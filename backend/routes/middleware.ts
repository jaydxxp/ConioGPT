import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config()
export default function Authmiddleware(req,res,next)
{
    const authheader = req.headers.authorization;
    if(!authheader || !authheader.startsWith("Bearer "))
    {
        return res.status(402).json({
            message:"NO Token Found"
        })
    }
    const token=authheader.split(" ")[1]
    try{
        const decoded=jwt.verify(token,process.env.JWT)
        req.userid=decoded.userid
        next();
    }
    catch(e)
    {
            return res.status(403).json({
                e
            })
    }
}