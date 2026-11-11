import crypto from "crypto";
import { ApiError } from "./ApiError.js";

const ALGORITHM = "aes-256-gcm";

const getEncryptionKey = () => {
  const key = Buffer.from(process.env.ENCRYPTION_KEY, "base64");

  if (key.length !== 32) {
    throw new ApiError(500, "ENCRYPTION_KEY must decode to 32 bytes");
  }

  return key;
};

export const encryptToken = (token) => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv);

  let encrypted = cipher.update(token, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag().toString("hex");

  return [iv.toString("hex"), authTag, encrypted].join(":");
};

export const decryptToken = (encryptedToken) => {
  const [ivHex, authTagHex, encrypted] = encryptedToken.split(":");
  if (!ivHex || !authTagHex || !encrypted) {
    throw new ApiError(400, "Invalid encrypted token format");
  }

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    getEncryptionKey(),
    Buffer.from(ivHex, "hex"),
  );

  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
};
