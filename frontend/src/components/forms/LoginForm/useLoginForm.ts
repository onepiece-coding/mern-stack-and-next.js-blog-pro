import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { loginUser } from "@/actions/auth";
import { toast } from "react-toastify";
import { useAuth } from "@/contexts/AuthContextProvider";

const useLoginForm = () => {
  const router = useRouter();
  const { setUserInfo } = useAuth();

  const initialState = {
    userInfo: null,
    errors: {},
    formData: { email: "", password: "" },
  };

  // When the form submits, useActionState resets the formData
  // 1️. The client sends a request to the Next.js API route (/api/...).
  // 2. Next.js API then forwards the request to the Express backend.
  // 3. Express interacts with MongoDB, processes data, and responds to Next.js.
  // 4. Next.js returns the final response to the client.
  const [state, formAction] = useActionState(loginUser, initialState);

  const { userInfo } = state;

  console.log("userInfo: ", userInfo);

  // To ensure that router.push("/") is not called before state.userInfo is fully updated.
  useEffect(() => {
    if (userInfo) {
      localStorage.setItem("userInfo", JSON.stringify(userInfo));
      setUserInfo(userInfo);
      toast.success("You have logged in successfully");
      router.replace(`/`);
    }
  }, [router, userInfo, setUserInfo]);

  return { formAction, state };
};

export default useLoginForm;
