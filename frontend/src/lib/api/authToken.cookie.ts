import { cookies } from "next/headers";

export async function getAuthToken() {
  const token = (await cookies()).get("authToken")?.value || "";
  return token;
}
