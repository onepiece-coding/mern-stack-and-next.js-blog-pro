import Link from "next/link";

const NotFoundPage = () => {
  return (
    <section className="min-h-[calc(100vh-62px)] container mx-auto p-6 flex justify-center items-center">
      <div className="text-center">
        <h1 className="mb-4 text-7xl tracking-tight font-extrabold lg:text-9xl text-primary-600 dark:text-primary-500">
          404
        </h1>
        <p className="mb-6 text-3xl tracking-tight font-bold text-gray-900 md:text-4xl dark:text-white">
          Something&apos;s missing.
        </p>
        <p className="mb-6 text-lg font-light text-gray-500 dark:text-gray-400">
          Sorry, we can&apos;t find that page. You&apos;ll find lots to explore
          on the home page.{" "}
        </p>
        <Link
          href={"/"}
          className="text-xl underline text-cyan-700"
          aria-label="Back to Homepage"
        >
          Back to Homepage
        </Link>
      </div>
    </section>
  );
};

export default NotFoundPage;
