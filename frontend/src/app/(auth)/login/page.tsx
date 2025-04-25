import { LoginForm } from "@/components/forms";
import { getAuthToken } from "@/lib/api/authToken.cookie";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Secure User Login | Blog Pro",
  description:
    "Login to Blog Pro to access exclusive content, manage your account, and engage with the community.",
  openGraph: {
    title: "Secure User Login | Blog Pro",
    description:
      "Login to Blog Pro to access exclusive content and engage with the community.",
    url: "https://yourwebsite.com/login",
    type: "website",
  },
  twitter: {
    title: "Secure User Login | Blog Pro",
    description:
      "Login to Blog Pro to access exclusive content and engage with the community.",
  },
};

const LoginPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ message: string }>;
}) => {
  // await new Promise((resolver) => setTimeout(resolver, 10000));

  const [token, { message }] = await Promise.all([
    getAuthToken(),
    searchParams,
  ]);

  if (token) {
    // signed in? right away go to home page
    redirect("/");
  }

  return (
    <section className="min-h-[calc(100vh-62px)] container mx-auto p-6 flex flex-col justify-center items-center">
      {/* 1) Show the message if present */}
      {message && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 rounded">
          {message}
        </div>
      )}
      <LoginForm />
    </section>
  );
};

export default LoginPage;
