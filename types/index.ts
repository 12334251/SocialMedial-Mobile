export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  picturePath: string;
  friends: { [key: string]: string };
}

export interface Comment {
  userId: string;
  firstName: string;
  lastName: string;
  comment: string;
}

export interface Post {
  _id: string;
  description: string;
  createdAt: string;
  firstName: string;
  lastName: string;
  comments: Comment[];
  likes: Record<string, boolean>;
  location: string;
  picturePath: string;
  updatedAt: string;
  userId: string;
  userPicturePath: string;
  isFriend?: string;
}
