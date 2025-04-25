import { Submit } from "@/components/forms";
import { Label, TextInput } from "flowbite-react";
import { redirect } from "next/navigation";

const ForgotPassword = async ({
  searchParams,
}: {
  searchParams: Promise<{ message: string }>;
}) => {
  // Pull the message out
  const { message } = await searchParams;

  const forgotPassword = async (formData: FormData) => {
    "use server";

    const response = await fetch(
      "http://localhost:5000/api/password/reset-password-link",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.get("email"),
        }),
      }
    );

    const data = await response.json();

    redirect(`/forgot-password?message=${encodeURIComponent(data.message)}`);
  };

  return (
    <section className="min-h-[calc(100vh-62px)] container mx-auto p-6 flex flex-col justify-center items-center">
      {/* 1) Show the message if present */}
      {message && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 rounded">
          {message}
        </div>
      )}
      <form
        className="flex w-full sm:w-[512px] flex-col gap-4"
        action={forgotPassword}
        role="Forgot Password"
        aria-labelledby="forgot-password-heading"
        aria-live="polite"
      >
        <div>
          <div className="mb-2 block">
            <Label htmlFor="email">Forgot Password</Label>
          </div>
          <TextInput
            id="email"
            type="email"
            name="email"
            placeholder="name@flowbite.com"
            required
          />
        </div>
        <Submit label="Submit" />
      </form>
    </section>
  );
};

export default ForgotPassword;
