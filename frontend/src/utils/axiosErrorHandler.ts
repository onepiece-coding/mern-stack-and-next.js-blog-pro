import { isAxiosError } from "axios";

const axiosErrorHandler = (error: unknown) => {
  if (isAxiosError(error)) {
    console.log(error.response?.data.message);
    return error.response?.data.message || error.message;
  } else {
    return "An Unexpected Error!";
  }
};

export default axiosErrorHandler;
