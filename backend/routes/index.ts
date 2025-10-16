import express from "express";
const app=express();
import SignupRoute from "./Signup"
import SigninRoute from "./Signin"
import { GoogleRouter } from "./googleauth";
const router=express.Router();
router.use("/auth",SignupRoute )
router.use("/auth",SigninRoute )
router.use("/auth", GoogleRouter);
export default router;

