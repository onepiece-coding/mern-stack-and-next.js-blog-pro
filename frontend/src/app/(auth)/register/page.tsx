import { RegisterForm } from "@/components/forms";
import { getAuthToken } from "@/lib/api/authToken.cookie";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Secure User Register | Blog Pro",
  description:
    "Join Blog Pro today and start exploring insightful articles. Register for free!",
  openGraph: {
    title: "Secure User Register | Blog Pro",
    description:
      "Join Blog Pro today and start exploring insightful articles. Register for free!",
    type: "website",
    url: "http://localhost:3000/",
  },
  twitter: {
    title: "Secure User Register | Blog Pro",
    description:
      "Join Blog Pro today and start exploring insightful articles. Register for free!",
  },
};

const RegisterPage = async () => {
  // await new Promise((resolver) => setTimeout(resolver, 10000));

  // Protect Route
  const token = await getAuthToken();

  if (token) {
    // signed in? right away go to home page
    redirect("/");
  }

  return (
    <section className="min-h-[calc(100vh-62px)] container mx-auto p-6 flex justify-center items-center">
      <RegisterForm />
    </section>
  );
};

export default RegisterPage;
