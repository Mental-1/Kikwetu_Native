import { create } from 'zustand';

interface PostAdState {
  title: string;
  description: string;
  price: number | null;
  location: string;
  condition: string;
  tags: string[];
  images: string[];
  videos: string[];
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  setPrice: (price: number | null) => void;
  setLocation: (location: string) => void;
  setCondition: (condition: string) => void;
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
    location: '',
    condition: '',
    tags: [],
    images: [],
    videos: [],
    setTitle: (title) => set((state) => ({ postAd: { ...state.postAd, title } })),
    setDescription: (description) =>
      set((state) => ({ postAd: { ...state.postAd, description } })),
    setPrice: (price) => set((state) => ({ postAd: { ...state.postAd, price } })),
    setLocation: (location) => set((state) => ({ postAd: { ...state.postAd, location } })),
    setCondition: (condition) => set((state) => ({ postAd: { ...state.postAd, condition } })),
    setTags: (tags) => set((state) => ({ postAd: { ...state.postAd, tags } })),
    setImages: (images) => set((state) => ({ postAd: { ...state.postAd, images } })),
    setVideos: (videos) => set((state) => ({ postAd: { ...state.postAd, videos } })),
  },
}));