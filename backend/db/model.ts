import mongoose, { Schema } from "mongoose"
import dotenv, { config } from "dotenv"
dotenv.config();
mongoose.connect(process.env.DBURL!)
export interface IInteraction extends Document {
  prompt: string;
  response: string;
  createdAt: Date;
}
export interface SSignup extends Document{
    username:string;
    name:string;
    email:string;
    password:string;
}

const InteractionSchema: Schema<IInteraction> = new Schema(
  {
    prompt: {
      type: String,
      required: true,
      trim: true,
    },
    response: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);
const SignupSchema:Schema<SSignup>= new Schema(
    {
        name:{
            type:String,
            required:true,
        },
        username:{
            type:String,
            required:true,
            unique:true
        },
        email:{
            type:String,
            required:true,
            unique:true
        },
        password:{
            type:String,
            required:true,
            min:3,
            max:12
        }
    }
)
const Interaction = mongoose.model<IInteraction>("Interaction", InteractionSchema);
const Signup = mongoose.model<SSignup>("Signup", SignupSchema);

export { Interaction, Signup};
