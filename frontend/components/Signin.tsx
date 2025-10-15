"use client";
import React, { useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";
import {
IconBrandGit,
  IconBrandGithub,
  IconBrandGoogle,
  IconBrandOnlyfans,
} from "@tabler/icons-react";
import axios from "axios";
import { Router } from "next/router";
import { useRouter } from "next/navigation";

export function SigninFormDemo() {
    const router=useRouter()
    const [inputs,setinputs]=useState({
        username:"",
        password:""
    })
  const handleSubmit = async  (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try{
        const res=await axios.post(process.env.NEXT_PUBLIC_BackendURL+"api/auth/signin" || "", inputs)
        const jwt=res.data.token || res.data.jwt;
        localStorage.setItem("token",jwt)
        router.push("/chat")
    }
    catch(e)
    {
        console.log(e);
    }

  };
  return (
    <div className="shadow-input mx-auto w-full max-w-md rounded-none bg-white p-2 md:rounded-2xl md:p-8 dark:bg-black">
      <h2 className="flex justify-center text-xl font-bold text-neutral-800 dark:text-neutral-200">
        Sign In
      </h2>

      <form className="my-8" onSubmit={handleSubmit}>

          <LabelInputContainer className="mb-4">
            <Label htmlFor="Username">Username</Label>
            <Input id="Username" placeholder="Jaydeep011" type="text" onChange={(e)=>setinputs({...inputs,username:e.target.value})} />
          </LabelInputContainer>
        <LabelInputContainer className="mb-4">
          <Label htmlFor="password">Password</Label>
          <Input id="password" placeholder="••••••••" type="password"  onChange={(e)=>setinputs({...inputs,password:e.target.value})}/>
        </LabelInputContainer>

        <button
          className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset]"
          type="submit"
        >
          Sign in &rarr;
          <BottomGradient />
        </button>

 <div className="flex items-center my-8 w-full">
  <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700" />
  <span className="px-4 text-neutral-500 dark:text-neutral-400">OR</span>
  <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700" />
</div>
        
        <div className="flex justify-center flex-row gap-2 ">
          <a href="https://backend-n70l.onrender.com/api/auth/google"
            className="group/btn shadow-input relative flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 font-medium text-black dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_#262626]"
            type="submit"
          >
            <IconBrandGoogle className="h-5 w-5 text-neutral-800 dark:text-neutral-300" />
            <BottomGradient />
          </a>
        
          
        </div>
      </form>
    </div>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};
