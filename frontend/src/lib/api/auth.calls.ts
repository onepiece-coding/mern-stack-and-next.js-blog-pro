const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function VerifyUserAccount(
  userId: string,
  token: string
): Promise<{ status: boolean; message: string }> {
  const response = await fetch(
    `${API_BASE_URL}/api/auth/${userId}/verify/${token}`
  );

  if (!response.ok) {
    console.error(`Error ${response.status}: Faild to verify account!`);
    throw new Error("Faild to verify account!");
  }

  return response.json();
}
