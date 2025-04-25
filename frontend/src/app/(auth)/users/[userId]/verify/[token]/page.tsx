import { VerifyUserAccount } from "@/lib/api/auth.calls";
import { BsPatchCheck, BsPatchExclamation } from "react-icons/bs";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog Pro | Account Verification",
  description: "Email Verification",
  openGraph: {
    title: "Blog Pro | Account Verification",
    description: "Email Verification",
  },
  twitter: {
    title: "Blog Pro | Account Verification",
    description: "Email Verification",
  },
};

interface VerifyEmailProps {
  params: Promise<{ userId: string; token: string }>;
}

const VerifyEmail = async ({ params }: VerifyEmailProps) => {
  const { userId, token } = await params;

  const { status, message } = await VerifyUserAccount(userId, token);

  return (
    <section className="min-h-[calc(100vh-62px)] container mx-auto p-6 flex justify-center items-center">
      <div className="text-center">
        {status ? (
          <>
            <div className="mb-4 flex justify-center">
              <BsPatchCheck className="w-24 h-24 text-green-600 dark:text-green-500" />
            </div>
            <p className="mb-4 text-3xl tracking-tight font-bold text-gray-900 md:text-4xl dark:text-white">
              {message}
            </p>
            <Link href={"/login"}>Go To Login Page</Link>
          </>
        ) : (
          <>
            <div className="mb-4 flex justify-center">
              <BsPatchExclamation className="w-24 h-24 text-red-600 dark:text-red-500" />
            </div>
            <p className="mb-4 text-3xl tracking-tight font-bold text-gray-900 md:text-4xl dark:text-white">
              {message}
            </p>
            <Link href={"/"}>Go To Home Page</Link>
          </>
        )}
      </div>
    </section>
  );
};

export default VerifyEmail;
