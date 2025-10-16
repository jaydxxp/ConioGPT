import express, { Router } from "express"
import z from "zod"
import jwt from "jsonwebtoken"
import { User } from "../db/model"

const SignupBody=z.object({
    name:z.string(),
    username:z.string(),
    email:z.string().email(),
    password:z.string().min(3).max(12),
})
const router=express.Router()
export default router.post("/signup",async (req,res,next)=>{
    const {success}=SignupBody.safeParse(req.body);
    if(!success)
    {
        return res.status(401).json({
            message:"Please Write Values in Given Format"
        })
    }
    const ExistingUser= await User.findOne({
        username:req.body.username,
        email:req.body.email
    })
    if(ExistingUser)
    {
        return res.status(402).json({
            message:"Username & Email should be unique"
        })
    }
    const user=await User.create({
        name:req.body.name,
        username:req.body.username,
        password:req.body.password,
        email:req.body.email

    })
    const userid=user._id;
    const token=jwt.sign({
        userid
    },process.env.JWT_SECRET!);
    return res.status(200).json({
        message:"Account Created Successfully",token,user
    })
})
