import { create } from 'zustand';

interface PostAdState {
  title: string;
  description: string;
  price: number | null;
  isNegotiable: boolean;
  location: string;
  condition: string;
  categoryId: number | null;
  subcategoryId: number | null;
  tags: string[];
  images: string[];
  videos: string[];
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  setPrice: (price: number | null) => void;
  setIsNegotiable: (isNegotiable: boolean) => void;
  setLocation: (location: string) => void;
  setCondition: (condition: string) => void;
  setCategoryId: (categoryId: number | null) => void;
  setSubcategoryId: (subcategoryId: number | null) => void;
  setTags: (tags: string[]) => void;
  setImages: (images: string[]) => void;
  setVideos: (videos: string[]) => void;
}

interface AppState {
  postAd: PostAdState;
}

export const useAppStore = create<AppState>((set) => ({
  postAd: {
    title: '',
    description: '',
    price: null,
    isNegotiable: false,
    location: '',
    condition: '',
    categoryId: null,
    subcategoryId: null,
    tags: [],
    images: [],
    videos: [],
    setTitle: (title) => set((state) => ({ postAd: { ...state.postAd, title } })),
    setDescription: (description) =>
      set((state) => ({ postAd: { ...state.postAd, description } })),
    setPrice: (price) => set((state) => ({ postAd: { ...state.postAd, price } })),
    setIsNegotiable: (isNegotiable) => set((state) => ({ postAd: { ...state.postAd, isNegotiable } })),
    setLocation: (location) => set((state) => ({ postAd: { ...state.postAd, location } })),
    setCondition: (condition) => set((state) => ({ postAd: { ...state.postAd, condition } })),
    setCategoryId: (categoryId) => set((state) => ({ postAd: { ...state.postAd, categoryId, subcategoryId: null } })),
    setSubcategoryId: (subcategoryId) => set((state) => ({ postAd: { ...state.postAd, subcategoryId } })),
    setTags: (tags) => set((state) => ({ postAd: { ...state.postAd, tags } })),
    setImages: (images) => set((state) => ({ postAd: { ...state.postAd, images } })),
    setVideos: (videos) => set((state) => ({ postAd: { ...state.postAd, videos } })),
  },
}));