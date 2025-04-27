const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function verifyUserAccount(
  userId: string,
  token: string
): Promise<{ success: boolean; message: string }> {
  console.log(`${API_BASE_URL}/api/auth/${userId}/verify/${token}`);
  const response = await fetch(
    `${API_BASE_URL}/api/auth/${userId}/verify/${token}`
  );

  if (!response.ok) {
    console.error(`Error ${response.status}: Faild to verify account!`);
    throw new Error("Faild to verify account!");
  }

  return response.json();
}
