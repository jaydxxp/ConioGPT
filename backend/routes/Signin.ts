
import express from "express"
import z from "zod"
import {Signup} from "../db/model.ts";
import jwt from "jsonwebtoken"
const SigninBody= z.object({
    username:z.string(),
    password:z.string().min(3).max(12)
})
const router= express.Router();
export default router.post("/signin",async(req,res,next)=>{
    const {success}=SigninBody.safeParse(req.body)
    if(!success)
    {
        return res.status(400).json({
            message:"Write the password Correctly"
        })
    }
    const user=await Signup.findOne({
        username:req.body.username,
        password:req.body.password
    })
    if(!user)
    {
        return res.status(401).json({
            message:"Wrong Password/Username"
        })
    }
    const token=jwt.sign({
            userid:user._id
        },process.env.JWT)
    return res.status(200).json({
        message:"Logged in Successfully",
        user,token
    })
})