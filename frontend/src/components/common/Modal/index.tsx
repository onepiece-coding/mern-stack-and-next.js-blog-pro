"use client";

import useModal from "./useModal";

export default function Modal({ children }: { children: React.ReactNode }) {
  const { overlay, wrapper, handleClick } = useModal();

  return (
    <div
      ref={overlay}
      className="fixed z-10 left-0 right-0 top-0 bottom-0 mx-auto bg-black/60 p-10"
      onClick={handleClick}
    >
      <div
        ref={wrapper}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-6 bg-white rounded-lg shadow-sm dark:bg-gray-700"
      >
        {children}
      </div>
    </div>
  );
}
