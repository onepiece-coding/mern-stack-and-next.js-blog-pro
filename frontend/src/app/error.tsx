"use client";

import { Button } from "flowbite-react";
import React from "react";

interface ErrorPageProps {
  error: Error;
  reset: () => void;
}

const ErrorPage = ({ error, reset }: ErrorPageProps) => {
  return (
    <section className="min-h-[calc(100vh-62px)] container mx-auto p-6 flex justify-center items-center">
      <div className="text-center">
        <h1 className="mb-4 text-7xl tracking-tight font-extrabold lg:text-9xl text-primary-600 dark:text-primary-500">
          500
        </h1>
        <p className="mb-6 text-3xl tracking-tight font-bold text-gray-900 md:text-4xl dark:text-white">
          Something went wrong!
        </p>
        <p className="mb-6 text-lg font-light text-gray-500 dark:text-gray-400">
          Error Message: {error.message}
        </p>
        <div className="flex justify-center">
          <Button onClick={() => reset()} aria-label="Try Again">
            Try Again
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ErrorPage;
