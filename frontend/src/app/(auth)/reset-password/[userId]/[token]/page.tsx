import { Submit } from "@/components/forms";
import { Label, TextInput } from "flowbite-react";
import { redirect } from "next/navigation";

interface ResetPasswordProps {
  params: Promise<{ userId: string; token: string }>;
}

const ResetPassword = async ({ params }: ResetPasswordProps) => {
  const { userId, token } = await params;

  let message = "";

  const response = await fetch(
    `http://localhost:5000/api/password/reset-password/${userId}/${token}`
  );

  if (!response.ok) message = "Invalid Link!";

  const resetPassword = async (formData: FormData) => {
    "use server";

    const response = await fetch(
      `http://localhost:5000/api/password/reset-password/${userId}/${token}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: formData.get("password"),
        }),
      }
    );

    const data = await response.json();

    redirect(`/login?message=${data.message}`);
  };

  return (
    <section className="min-h-[calc(100vh-62px)] container mx-auto p-6 flex flex-col justify-center items-center">
      {message ? (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">
          {message}
        </div>
      ) : (
        <form
          className="flex w-full sm:w-[512px] flex-col gap-4"
          action={resetPassword}
          role="Reset Password"
          aria-labelledby="reset-password-heading"
          aria-live="polite"
        >
          <div>
            <div className="mb-2 block">
              <Label htmlFor="password">Reset Password</Label>
            </div>
            <TextInput id="password" type="password" name="password" required />
          </div>
          <Submit label="Submit" />
        </form>
      )}
    </section>
  );
};

export default ResetPassword;
