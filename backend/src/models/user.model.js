import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    githubId: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      default: "",
    },
    githubAccessToken: {
      type: String,
      required: true,
      select: false,
    },
    avatarUrl: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      default: "",
    },
    scopes: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

export default User;
