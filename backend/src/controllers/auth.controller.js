import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { encryptToken } from "../utils/tokenEncryption.js";

const FRONTEND_URL = process.env.FRONTEND_URL;

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
};

// Step 1: Redirect user to GitHub
const githubLogin = (req, res) => {
  const state = crypto.randomBytes(32).toString("hex");

  res.cookie("github_oauth_state", state, {
    ...cookieOptions,
    maxAge: 10 * 60 * 1000,
  });

  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    redirect_uri: process.env.GITHUB_CALLBACK_URL,
    scope: "read:user public_repo",
    state,
  });

  const githubUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;

  return res.redirect(githubUrl);
};

// Step 2: GitHub redirects back to our backend
const githubCallback = async (req, res) => {
  try {
    const { code, state, error } = req.query;

    if (error) {
      return res.redirect(`${FRONTEND_URL}/?auth_error=github_denied`);
    }

    const savedState = req.cookies.github_oauth_state;

    res.clearCookie("github_oauth_state", cookieOptions);

    if (
      typeof state !== "string" ||
      typeof savedState !== "string" ||
      state.length !== savedState.length ||
      !crypto.timingSafeEqual(Buffer.from(state), Buffer.from(savedState))
    ) {
      return res.status(403).send("Invalid OAuth state");
    }

    if (!code || typeof code !== "string") {
      return res.status(400).send("Authorization code missing");
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
        }),
      },
    );

    if (!tokenResponse.ok) {
      throw new Error("GitHub token exchange failed");
    }

    const tokenData = await tokenResponse.json();

    if (tokenData.error || !tokenData.access_token) {
      throw new Error(
        tokenData.error_description || "GitHub authorization failed",
      );
    }

    const accessToken = tokenData.access_token;

    // Fetch authenticated GitHub profile
    const profileResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    if (!profileResponse.ok) {
      throw new Error("Unable to fetch GitHub profile");
    }

    const profile = await profileResponse.json();

    const scopes = (tokenData.scope || "").split(/[,\s]+/).filter(Boolean);

    // Create or update user
    const user = await User.findOneAndUpdate(
      { githubId: String(profile.id) },
      {
        $set: {
          username: profile.login,
          name: profile.name || "",
          avatarUrl: profile.avatar_url,
          email: profile.email || "",
          githubAccessToken: encryptToken(accessToken),
          scopes,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      },
    );

    // Create application session
    const sessionToken = jwt.sign(
      { userId: user._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.cookie("token", sessionToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.redirect(`${FRONTEND_URL}/?connected=1`);
  } catch (error) {
    console.error("GitHub OAuth error:", error.message);

    return res.redirect(`${FRONTEND_URL}/?auth_error=authentication_failed`);
  }
};

// Step 3: Get logged-in user
const getCurrentUser = async (req, res) => {
  const user = await User.findById(req.userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  return res.status(200).json({
    success: true,
    user: {
      id: user._id,
      githubId: user.githubId,
      username: user.username,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
    },
  });
};

// Step 4: Logout
const logout = (req, res) => {
  res.clearCookie("token", cookieOptions);

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

export { 
    githubLogin,
    githubCallback, 
    getCurrentUser, 
    logout
};