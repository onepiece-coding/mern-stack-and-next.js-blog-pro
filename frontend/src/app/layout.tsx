import { Inter } from "next/font/google";
import { Flowbite } from "flowbite-react";
import { Header } from "@/components/common";
import { ToastContainer } from "react-toastify";
import { getAuthToken } from "@/lib/api/authToken.cookie";
import AuthContextProvider from "@/contexts/AuthContextProvider";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const token = await getAuthToken();

  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-white text-gray-600 antialiased dark:bg-gray-900 dark:text-gray-400`}
      >
        <AuthContextProvider token={token}>
          <Flowbite>
            <Header token={token} />
            <ToastContainer
              theme="colored"
              position="top-center"
              autoClose={2000}
            />
            <main>{children}</main>
          </Flowbite>
        </AuthContextProvider>
      </body>
    </html>
  );
}
