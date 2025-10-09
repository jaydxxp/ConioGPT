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
    googleid:string;
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
  name: {
    type: String,
    required: function() {
      // name required only if not using google oauth
      return !this.googleid;
    }
  },
  username: {
    type: String,
    unique: true,
    sparse: true
  },
  email: {
    type: String,
    required: function() {
      // email required only if not using google oauth
      return !this.googleid;
    },
    unique: true,
    sparse: true
  },
  password: {
    type: String,
    minlength: 3,
    maxlength: 12,
    required: function() {
      // password required only if not google oauth
      return !this.googleid;
    }
  },
  googleid: {
    type: String,
    unique: true,
    sparse: true
  }
}
)
const Interaction = mongoose.model<IInteraction>("Interaction", InteractionSchema);
const Signup = mongoose.model<SSignup>("Signup", SignupSchema);

export { Interaction, Signup};
