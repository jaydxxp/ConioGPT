import express from "express";
const app=express();
import SignupRoute from "./Signup.ts"
import SigninRoute from "./Signin.ts"
import { GoogleRouter } from "./googleauth.ts";
const router=express.Router();
router.use("/auth",SignupRoute )
router.use("/auth",SigninRoute )
router.use("/auth", GoogleRouter);
export default router;

