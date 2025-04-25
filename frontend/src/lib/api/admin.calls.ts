export const dataFetching = async <T>(
  url: string,
  token?: string
): Promise<T> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
    headers: {
      authorization: token ? `Bearer ${token}` : "",
    },

    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Error ${response.status}: Failed to fetch info!`);
  }

  return response.json();
};
