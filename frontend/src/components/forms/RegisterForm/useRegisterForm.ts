import { registerUser } from "@/actions/auth";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { toast } from "react-toastify";

const useRegisterForm = () => {
  const router = useRouter();

  const [state, formAction] = useActionState(registerUser, {
    errors: {},
    formData: {
      username: "",
      email: "",
      password: "",
    },
    message: "",
  });

  useEffect(() => {
    if (state.message) {
      toast.success(state.message);
      router.replace(`/login`);
    }
  }, [router, state.message]);

  return { state, formAction };
};

export default useRegisterForm;
