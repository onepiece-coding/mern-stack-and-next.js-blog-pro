"use client";

import TextInput from "../inputs/TextInput";
import PasswordInput from "../inputs/PasswordInput";
import Link from "next/link";
import Submit from "../Submit";
import useRegisterForm from "./useRegisterForm";

const RegisterForm = () => {
  const { state, formAction } = useRegisterForm();

  return (
    <form
      className="flex w-full sm:w-[512px] flex-col gap-4"
      action={formAction}
      role="Register User"
      aria-labelledby="register-user-heading"
      noValidate
    >
      <h2 id="register-user-heading" className="sr-only">
        Register User
      </h2>
      <TextInput
        label="Your Username"
        name={"username"}
        defaultValue={state.formData?.username || ""}
        error={state.errors?.username}
        required
      />
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
      <Submit label="Register" />
      <p className="font-normal text-gray-700 dark:text-gray-400 line-clamp-5">
        Already have an account?
        <Link
          href="/login"
          className="ml-1 font-medium text-cyan-600 hover:underline dark:text-cyan-500"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
};

export default RegisterForm;
