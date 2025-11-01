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

export interface Category {
  id: string;
  name: string;
  icon: string;
}
export interface SubCategory {
  id: string;
  name: string;
  icon: string;
  parentCategory: Category;
}
export interface ListingsCard {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string | number[];
  rating: number;
  reviews: Review[];
  seller: User;
}
export interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
  duration: number;
  maxListings: number;
}
export interface ListingItem {
    id: string;
    title: string;
    description: string | null;
    price: number | null;
    images: string[] | null;
    condition: string | null;
    location: string | null;
    views: number | null;
    category_id: number | null;
    subcategory_id: number | null;
    created_at: string | null;
    status: string | null;
}

export interface TransactionItem {
    id: string;
    created_at: string | number;
    payment_method: string;
    status: "completed" | "pending" | "failed";
    amount: number;
    listings?: {
        id: string;
        title: string;
    }[];
}

export interface RecentActivityItem {
    id: string;
    title: string;
    description: string;
    date: string;
    icon: string;
    amount?: number;
}

export interface DashboardData {
    activeListings: ListingItem[];
    pendingListings: ListingItem[];
    expiredListings: ListingItem[];
    transactions: TransactionItem[];
    recentActivity: RecentActivityItem[];
}

export interface AdFormData {
    title: string;
    description: string;
    category: string;
    subcategory: string;
    price: string;
    negotiable: boolean;
    condition: "new" | "used" | "refurbished" | "like-new" | "like_new" | "";
    location: string;
    latitude?: number;
    longitude?: number;
    mediaUrls: string[];
    paymentTier: string;
    paymentMethod: string;
    phoneNumber: string;
    email: string;
}

export interface AdDetailsFormData {
    title: string;
    description: string;
    category: string;
    subcategory: string;
    price: string;
    negotiable: boolean;
    condition: "new" | "used" | "refurbished" | "like-new" | "like_new" | "";
    location: string | number[];
    latitude?: number;
    longitude?: number;
}

export interface ActionResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    errors?: Record<string, string>;
    message?: string;
}

export interface ListingCreateData {
    title: string;
    description: string;
    price: number;
    category_id: number;
    subcategory_id?: number;
    condition: string;
    location: string;
    latitude?: number;
    longitude?: number;
    negotiable: boolean;
    images: string[];
    user_id: string;
    status: string;
    payment_status: string;
    plan: string;
    views: number;
    created_at: string;
    updated_at: string;
    expiry_date: string;
}

export interface ValidatedListingData {
    title: string;
    description: string;
    price: number;
    category: string;
    subcategory?: string;
    condition: "new" | "used" | "refurbished" | "like-new" | "like_new";
    location: string;
    latitude?: number;
    longitude?: number;
    negotiable: boolean;
    phoneNumber?: string;
    email?: string;
}
export interface SessionData {
    id?: string;
    user_id?: string;
    expires_at: number;
    created_at: string;
    isLoggedIn: boolean;
    isPaid: boolean;
    isVerified: boolean;
}
export interface Session {
    data: SessionData;
}
export interface MapListing {
    id: number;
    title: string;
    price: number;
    image_url: string;
    distance_km: number;
    lat: number;
    lng: number;
}

export interface UserLocation {
    lat: number;
    lng: number;
}
export type Profile = {
    id: string;
    email: string;
    avatar_url?: string;
    full_name?: string;
    username?: string;
    phone_number?: string;
};

export type User = {
    id: string;
    email?: string;
    created_at: string;
    banned_until?: string;
    profile?: {
        is_flagged?: boolean;
    };
};

export interface SearchFilters {
    categories: number[];
    subcategories: number[];
    conditions: string[];
    priceRange: {
        min: number;
        max: number;
    };
    maxDistance: number;
    searchQuery: string;
}

export interface SearchParams {
    page: number;
    pageSize: number;
    filters: SearchFilters;
    sortBy: string;
    userLocation?: {
        lat: number;
        lon: number;
    } | null;
}

export interface ListingsResponse {
    data: ListingItem[];
    totalCount: number;
    hasMore: boolean;
}

