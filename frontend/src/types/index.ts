export type TCategory = {
  _id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

export type TComment = {
  _id: string;
  text: string;
  user: string;
  username: string;
  createdAt: string;
  updatedAt: string;
};

export type TImage = {
  url: string;
};

export type TUser = {
  id: string;
  username: string;
  profilePhoto: TImage;
  bio: string;
  email: string;
  posts: TPost[];
  isAdmin: boolean;
  isAccountVerified: boolean;
  createdAt: string;
};

export type TPost = {
  _id: string;
  image: TImage;
  title: string;
  description: string;
  user: TUser;
  category: string;
  likes: string[];
  comments: TComment[];
  createdAt: string;
  updatedAt: string;
};

// API Response Types
export type PaginatedResponse<T> = {
  posts: T[];
  totalPages: number;
  // currentPage: number;
  // totalItems: number;
};

// Query Parameters Type
export type PostsQueryParams = {
  pageNumber?: string;
  category?: string;
  title?: string;
  // limit?: string; // Consider adding pagination limit
};

export type TInfo = {
  users: number;
  posts: number;
  categories: number;
  comments: number;
};
