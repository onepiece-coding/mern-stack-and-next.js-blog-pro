"use client";

import TextInput from "../inputs/TextInput";
import Link from "next/link";
import PasswordInput from "../inputs/PasswordInput";
import useLoginForm from "./useLoginForm";
import Submit from "../Submit";

const LoginForm = () => {
  const { formAction, state } = useLoginForm();

  console.log("LoginForm: ", state);

  return (
    <form
      className="flex w-full sm:w-[512px] flex-col gap-4"
      action={formAction}
      role="Login User"
      aria-labelledby="login-user-heading"
      aria-live="polite"
    >
      <h2 id="login-user-heading" className="sr-only">
        Login User
      </h2>
      <TextInput
        label="Your Email"
        type="email"
        name={"email"}
        defaultValue={state.formData?.email || ""}
        error={state.errors?.email}
        required
      />
      <PasswordInput
        label="Your Password"
        name={"password"}
        error={state.errors?.password}
        required
      />
      <Submit label="Login" />
      <div className="flex justify-between items-center">
        <Link
          href="/register"
          className="ml-1 font-medium text-cyan-600 hover:underline dark:text-cyan-500"
        >
          Sign up
        </Link>
        <Link
          href="/forgot-password"
          className="ml-1 font-medium text-cyan-600 hover:underline dark:text-cyan-500"
        >
          Forgot Password
        </Link>
      </div>
    </form>
  );
};

export default LoginForm;
