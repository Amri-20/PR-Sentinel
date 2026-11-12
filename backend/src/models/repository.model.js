import mongoose from "mongoose";

const repositoriesSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    githubRepoId: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    ownerLogin: {
      type: String,
      required: true,
    },
    decryption: {
      type: String,
      required: true,
    },
    htmlUrl: {
      type: String,
      default: "",
    },
    language: {
      type: String,
      default: null,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    defaultBranch: {
      type: String,
      default: "main",
    },
    stars: {
      type: Number,
      default: 0,
    },
    forks: {
      type: Number,
      default: 0,
    },
    openIssuesCount: {
      type: Number,
      default: 0,
    },
    githubUpdatedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

repositorySchema.index(
  {
    user: 1,
    githubRepoId: 1,
  },
  { unique: true },
);


export const Repository=mongoose.model("Repository",repositoriesSchema)