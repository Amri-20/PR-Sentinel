import mongooes from "mongoose";

const userSchema = new mongooes.Schema(
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
    githubAcessToken: {
      type: String,
      required: true,
      select: false,
    },
    scopes: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true },
);

const User = mongooes.model("User", userSchema);

export default User;
