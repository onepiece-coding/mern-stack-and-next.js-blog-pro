import { Spinner } from "flowbite-react";

const RegisterPageLoading = () => {
  return (
    <section role="status" aria-live="polite">
      <div className="h-[calc(100vh-62px)] flex justify-center items-center">
        <Spinner aria-label="Extra large spinner example" size="xl" />
      </div>
    </section>
  );
};

export default RegisterPageLoading;
