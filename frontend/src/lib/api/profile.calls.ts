import { TUser } from "../../types/index";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getUserProfile(userId: string): Promise<TUser> {
  const response = await fetch(`${API_BASE_URL}/api/users/profile/${userId}`);

  if (!response.ok) {
    console.error(`Error ${response.status}: Failed to fetch profile`);
    throw new Error(`Error ${response.status}: Failed to fetch profile`);
  }

  return response.json();
}

export async function getMe(
  token: string
): Promise<{ result: { isAdmin: boolean; id: string } }> {
  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    headers: {
      authorization: token ? `Bearer ${token}` : "",
    },
  });

  if (!response.ok) {
    console.error(`Error ${response.status}: Failed to fetch user`);
    throw new Error(`Error ${response.status}: Failed to fetch user`);
  }

  return response.json();
}
