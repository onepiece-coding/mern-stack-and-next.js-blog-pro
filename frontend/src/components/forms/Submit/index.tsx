"use client";

import { Button, Spinner } from "flowbite-react";
import React from "react";
import { useFormStatus } from "react-dom";

const Submit = ({ label }: { label: string }) => {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} aria-live="polite">
      {pending ? (
        <div className="flex items-center gap-2">
          <Spinner aria-label="Loading..." /> Loading...
        </div>
      ) : (
        label
      )}
    </Button>
  );
};

export default Submit;
