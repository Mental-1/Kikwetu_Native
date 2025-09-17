export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string | number[];
  rating: number;
  reviews: Review[];
  seller: User;
}
export interface Review {
  id: string;
  rating: number;
  comment: string;
  user: User;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}
