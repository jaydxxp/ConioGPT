import mongoose, { Schema, Document } from "mongoose";
import dotenv from "dotenv";

dotenv.config();

mongoose
  .connect(process.env.DBURL!)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

/* -----------------------------------------------------
   🧍 USER INTERFACES & SCHEMA
----------------------------------------------------- */
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  username?: string;
  name?: string;
  email?: string;
  password?: string;
  googleid?: string;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: function () {
        return !this.googleid;
      },
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
    },
    email: {
      type: String,
      required: function () {
        return !this.googleid;
      },
      unique: true,
      sparse: true,
    },
    password: {
      type: String,
      minlength: 3,
      maxlength: 12,
      required: function () {
        return !this.googleid;
      },
    },
    googleid: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", UserSchema);

/* -----------------------------------------------------
   💬 MESSAGE INTERFACES & SCHEMA
----------------------------------------------------- */
export interface IMessage extends Document {
  _id: mongoose.Types.ObjectId;
  chat: mongoose.Types.ObjectId;
  sender: "user" | "assistant";
  content: string;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    chat: { type: Schema.Types.ObjectId, ref: "Chat", required: true },
    sender: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Message = mongoose.model<IMessage>("Message", MessageSchema);

/* -----------------------------------------------------
   💭 CHAT INTERFACES & SCHEMA
----------------------------------------------------- */
export interface IChat extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  title?: string;
  messages: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const ChatSchema = new Schema<IChat>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, trim: true },
    messages: [{ type: Schema.Types.ObjectId, ref: "Message" }],
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Chat = mongoose.model<IChat>("Chat", ChatSchema);




export interface IMessagePopulated extends Omit<IMessage, 'chat'> {
  chat: IChat;
}

export interface IChatPopulated extends Omit<IChat, 'messages'> {
  messages: IMessage[];
}


export interface IChatWithUser extends Omit<IChat, 'user'> {
  user: IUser;
}


export interface IChatFullyPopulated extends Omit<IChat, 'user' | 'messages'> {
  user: IUser;
  messages: IMessage[];
}


export type IMessageLean = {
  _id: mongoose.Types.ObjectId;
  chat: mongoose.Types.ObjectId;
  sender: "user" | "assistant";
  content: string;
  createdAt: Date;
};

export type IChatLean = {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  title?: string;
  messages: mongoose.Types.ObjectId[];
  createdAt: Date;
};

export type IChatPopulatedLean = {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  title?: string;
  messages: IMessageLean[];
  createdAt: Date;
};