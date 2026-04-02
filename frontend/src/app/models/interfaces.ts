export interface User {
  _id?: string;
  name: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  email: string;
  phone: string;
  role: 'buyer' | 'agent' | 'host' | 'admin';
  profilePic?: string;
  profilePhoto?: string;
  status?: 'active' | 'banned';
  suspendedUntil?: string;
  isOnline?: boolean;
  bio?: string;
  gender?: string;
  dateOfBirth?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
  };
  company?: string;
  designation?: string;
  website?: string;
  experience?: string;
  specialization?: string;
  languages?: string[];
  reraNumber?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    instagram?: string;
    facebook?: string;
  };
  isProfileComplete?: boolean;
  isVerified?: boolean;
  createdAt?: string;
  lastLogin?: string;
  token?: string;
  favorites?: string[];
  blockedUsers?: string[];
}

export interface Property {
  _id?: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  type: 'rent' | 'sale';
  propertyType: 'Flat' | 'Row House' | 'Bungalow' | 'Plot' | 'Commercial' | 'Penthouse';
  bedrooms: number;
  bathrooms: number;
  area: number;
  furnishing: 'Furnished' | 'Semi' | 'Unfurnished';
  state?: string;
  location: string;
  address?: string;
  nearbyLandmarks?: string[];
  images?: string[];
  ratings?: {
    _id?: string;
    user: any;
    rating: number;
    review?: string;
    date?: string;
    likes?: string[];
  }[];
  averageRating?: number;
  lat?: number;
  lng?: number;
  postedBy?: any;
  views?: number;
  status?: 'active' | 'pending' | 'sold/rented';
  createdAt?: string;
  updatedAt?: string;
}

export interface Message {
  _id?: string;
  from: any;
  to: any;
  property?: any;
  text?: string;
  file?: {
    url: string;
    type: string;
    name: string;
    size: number;
  };
  reactions?: {
    emojiCode: string;
    user: string | User;
  }[];
  read: boolean;
  createdAt?: string;
}

export interface Conversation {
  user: User;
  lastMessage?: Message;
  property?: Property;
  unreadCount: number;
  updatedAt?: string;
}
