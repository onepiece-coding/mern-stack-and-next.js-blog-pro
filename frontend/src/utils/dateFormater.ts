import { toast } from "react-toastify";

export function dateFormater(date: string) {
  if (!date) return "";

  try {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    toast.error(`Invalid date ${date}`);
  }
}
