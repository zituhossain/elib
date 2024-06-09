import { User } from "../user/userTypes";

export interface Book {
  _id: string;
  title: string;
  author: User;
  genre: string;
  description: string;
  coverImage: string;
  file: string;
  coverImagePublicId: string;
  filePublicId: string;
  createdAt: Date;
  updatedAt: Date;
}
