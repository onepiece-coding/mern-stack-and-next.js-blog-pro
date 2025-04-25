import { TUser } from "@/types";
import { createContext } from "react";
import { CommentState } from "./CommentsContextProvider";
import { DashboardState } from "./DashboardContextProvider";

interface TAuthContext {
  userInfo: TUser | null;
  setUserInfo: (user: TUser | null) => void;
  logoutHandler: () => void;
}

interface TCommentsContext {
  commentState: CommentState;
  setCommentState: React.Dispatch<React.SetStateAction<CommentState>>;
  onSubmit: (postId: string, token: string, commentId?: string) => void;
}

interface DashboardContext {
  setDashboardState: React.Dispatch<React.SetStateAction<DashboardState>>;
}

export const AuthContext = createContext<TAuthContext>({
  userInfo: null,
  setUserInfo: () => {},
  logoutHandler: () => {},
});

export const CommentsContext = createContext<TCommentsContext>({
  commentState: {
    loading: false,
    text: "",
    status: "add",
    id: null,
    token: null,
    openModal: false,
  },
  setCommentState: () => {},
  onSubmit: async () => {},
});

export const DashboardContext = createContext<DashboardContext>({
  setDashboardState: () => {},
});
