import express from "express";
const app=express();
import SignupRoute from "./Signup.ts"
import SigninRoute from "./Signin.ts"
const router=express.Router();
router.use("/auth",SignupRoute )
router.use("/auth",SigninRoute )
export default router;

