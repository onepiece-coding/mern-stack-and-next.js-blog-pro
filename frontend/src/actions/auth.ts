"use server";

import axiosInstance from "@/lib/api/axiosInstance";
import { loginSchema, TLoginFormInputs } from "@/lib/validations/loginSchema";
import {
  registerSchema,
  TRegisterFormInputs,
} from "@/lib/validations/registerSchema";
import { TUser } from "@/types";
import { axiosErrorHandler } from "@/utils";
import { cookies } from "next/headers";

type Errors = {
  email?: string;
  password?: string;
  username?: string;
};

type LoginStatus = {
  userInfo?: TUser;
  errors?: Errors;
  formData?: TLoginFormInputs;
};

type LoginResponse = {
  token: string;
  user: TUser;
};

export type RegisterStatus = {
  errors?: Errors;
  formData?: TRegisterFormInputs;
  message?: string;
};

type RegisterResponse = {
  message: string;
};

export async function loginUser(
  _prevState: LoginStatus,
  formData: FormData
): Promise<LoginStatus> {
  // Validate with Zod
  const validatedData = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  // Handle Zod validation errors and return previous form values
  if (!validatedData.success) {
    const errors: Errors = {};

    validatedData.error.issues.forEach((issue) => {
      errors[issue.path[0] as keyof Errors] = issue.message;
    });

    return {
      errors,
      formData: {
        email: formData.get("email") as string, // Preserve input value
        password: "", // Keep password empty for security reasons
      },
    };
  }

  try {
    const response = await axiosInstance.post<LoginResponse>(
      "/api/auth/login",
      validatedData.data
    );

    // Set cookies
    const cookiesStore = await cookies();

    // Automatically updates cookies and sends them with the response.
    cookiesStore.set("authToken", response.data.token, {
      // Prevents access via JavaScript (more secure)
      httpOnly: true,
      // Only send over HTTPS in production
      secure: process.env.NODE_ENV === "production",
      // Prevents CSRF (XSS) attacks
      sameSite: "strict",
      // 7 days expiration
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    // ❌ Less secure than httpOnly: true because any malicious JavaScript (XSS) code can access user data.
    // cookiesStore.set("userInfo", JSON.stringify(response.data.user));

    // return userInfo
    return {
      userInfo: response.data.user,
    };
  } catch (error) {
    console.log("Login Error: ", error);
    return {
      errors: { email: axiosErrorHandler(error) },
      formData: {
        email: formData.get("email") as string, // Preserve input value
        password: "", // Keep password empty for security reasons
      },
    };
  }
}

export async function registerUser(
  _prevState: LoginStatus,
  formData: FormData
): Promise<RegisterStatus> {
  // Validate with Zod
  const validatedData = registerSchema.safeParse({
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  // Handle Zod validation errors and return previous form values
  if (!validatedData.success) {
    const errors: Errors = {};

    validatedData.error.issues.forEach((issue) => {
      errors[issue.path[0] as keyof Errors] = issue.message;
    });

    return {
      errors,
      formData: {
        username: formData.get("username") as string,
        email: formData.get("email") as string,
        password: "",
      },
    };
  }

  try {
    const response = await axiosInstance.post<RegisterResponse>(
      "/api/auth/register",
      validatedData.data
    );
    return { message: response.data.message };
  } catch (error) {
    console.log("Login Error: ", error);
    return {
      errors: { email: axiosErrorHandler(error) },
      formData: { ...validatedData.data, password: "" },
    };
  }
}

export async function logoutUser() {
  (await cookies()).delete("authToken");
}
