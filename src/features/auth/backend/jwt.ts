import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = "7d"; // 7일

export type JWTPayload = {
  userId: string;
  email: string;
  nickname: string;
};

export const generateToken = async (
  payload: JWTPayload,
): Promise<string> => {
  const secret = new TextEncoder().encode(JWT_SECRET);

  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(secret);

  return token;
};

export const verifyToken = async (
  token: string,
): Promise<JWTPayload | null> => {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
};
