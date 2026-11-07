import { cookies } from "next/headers";
import { User } from "@/types/jatra";

/**
 * Safely decodes base64url encoded string in both Node and Edge environments
 */
function decodeBase64Url(base64Url: string): string {
  try {
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    if (typeof Buffer !== "undefined") {
      return Buffer.from(base64, "base64").toString("utf-8");
    }
    return decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
  } catch {
    return "";
  }
}

/**
 * Decodes JWT payload without external network calls
 */
export function decodeJwtPayload(token: string): any {
  if (!token || typeof token !== "string") return null;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const jsonString = decodeBase64Url(parts[1]);
    if (!jsonString) return null;
    return JSON.parse(jsonString);
  } catch {
    return null;
  }
}

/**
 * Fetches the current user server-side in Server Components using cookies.
 * Decodes the JWT directly to extract user id, name, role, email, status.
 * Executes in < 0.1ms without any database or API round-trips.
 */
export async function getServerCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const token =
      cookieStore.get("accessToken")?.value ||
      cookieStore.get("token")?.value;

    if (!token) {
      return null;
    }

    const payload = decodeJwtPayload(token);
    if (!payload) {
      return null;
    }

    // Check expiration (exp is in seconds)
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null;
    }

    const userId = payload.userId || payload.id;
    if (!userId) {
      return null;
    }

    const user: User = {
      id: userId,
      fullName: payload.fullName || payload.name || "",
      name: payload.name || payload.fullName || "",
      email: payload.email || "",
      phone: payload.phone || "",
      role: payload.role || "CUSTOMER",
      image: payload.image || undefined,
      status: payload.status || "ACTIVE",
    };

    return user;
  } catch (error: any) {
    if (error?.digest === "DYNAMIC_SERVER_USAGE" || error?.name === "DynamicServerError") {
      throw error;
    }
    return null;
  }
}
