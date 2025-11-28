import { zustandStorage } from "@/utils/storage";
import { MMKV } from "react-native-mmkv";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const userPlanStorage = new MMKV({ id: "user-plan" });

export const getUserPlan = () => ({
  maxListings: userPlanStorage.getNumber("maxListings") ?? 5,
  usedListings: userPlanStorage.getNumber("usedListings") ?? 0,
  planName: userPlanStorage.getString("planName") ?? "Free",
  renewalDate: userPlanStorage.getString("renewalDate") ?? null,
});

export const setUserPlan = (plan: {
  maxListings?: number;
  usedListings?: number;
  planName?: string;
  renewalDate?: string | null;
}) => {
  if (plan.maxListings !== undefined) {
    userPlanStorage.set("maxListings", plan.maxListings);
  }
  if (plan.usedListings !== undefined) {
    userPlanStorage.set("usedListings", plan.usedListings);
  }
  if (plan.planName !== undefined) {
    userPlanStorage.set("planName", plan.planName);
  }
  if (plan.renewalDate !== undefined) {
    if (plan.renewalDate === null) {
      userPlanStorage.delete("renewalDate");
    } else {
      userPlanStorage.set("renewalDate", plan.renewalDate);
    }
  }
};

interface PostAdState {
  title: string;
  description: string;
  price: number | null;
  categoryId: number | null;
  subcategoryId: number | null;
  condition: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  isNegotiable: boolean;
  images: string[];
  videos: string[];
  uploadedMedia: { uri: string; id: string; type: "image" | "video" }[];
  tags: string[];
  storeId?: string;
  isDraft: boolean;
  attributes: Record<string, any>;
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  setPrice: (price: number | null) => void;
  setCategoryId: (id: number | null) => void;
  setSubcategoryId: (id: number | null) => void;
  setCondition: (condition: string) => void;
  setLocation: (
    location: string,
    lat?: number | null,
    long?: number | null,
  ) => void;
  setLatitude: (latitude: number | null) => void;
  setLongitude: (longitude: number | null) => void;
  setIsNegotiable: (isNegotiable: boolean) => void;
  setImages: (images: string[]) => void;
  setVideos: (videos: string[]) => void;
  setUploadedMedia: (
    uploadedMedia: { uri: string; id: string; type: "image" | "video" }[],
  ) => void;
  setTags: (tags: string[]) => void;
  setStoreId: (id: string | undefined) => void;
  setIsDraft: (isDraft: boolean) => void;
  setAttributes: (attributes: Record<string, any>) => void;
  setAttribute: (key: string, value: any) => void;
  resetPostAd: () => void;
}

interface AppState {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  postAd: PostAdState;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      searchQuery: "",
      setSearchQuery: (query) => set({ searchQuery: query }),

      postAd: {
        title: "",
        description: "",
        price: null,
        categoryId: null,
        subcategoryId: null,
        condition: "New",
        location: "",
        latitude: null,
        longitude: null,
        isNegotiable: false,
        images: [],
        videos: [],
        uploadedMedia: [],
        tags: [],
        isDraft: false,
        attributes: {},

        setTitle: (title) =>
          set((state) => ({ postAd: { ...state.postAd, title } })),
        setDescription: (description) =>
          set((state) => ({ postAd: { ...state.postAd, description } })),
        setPrice: (price) =>
          set((state) => ({ postAd: { ...state.postAd, price } })),
        setCategoryId: (categoryId) =>
          set((state) => ({ postAd: { ...state.postAd, categoryId } })),
        setSubcategoryId: (subcategoryId) =>
          set((state) => ({ postAd: { ...state.postAd, subcategoryId } })),
        setCondition: (condition) =>
          set((state) => ({ postAd: { ...state.postAd, condition } })),
        setLocation: (location, latitude, longitude) =>
          set((state) => ({
            postAd: {
              ...state.postAd,
              location,
              latitude: latitude ?? state.postAd.latitude,
              longitude: longitude ?? state.postAd.longitude,
            },
          })),
        setLatitude: (latitude) =>
          set((state) => ({ postAd: { ...state.postAd, latitude } })),
        setLongitude: (longitude) =>
          set((state) => ({ postAd: { ...state.postAd, longitude } })),
        setIsNegotiable: (isNegotiable) =>
          set((state) => ({ postAd: { ...state.postAd, isNegotiable } })),
        setImages: (images) =>
          set((state) => ({ postAd: { ...state.postAd, images } })),
        setVideos: (videos) =>
          set((state) => ({ postAd: { ...state.postAd, videos } })),
        setUploadedMedia: (uploadedMedia) =>
          set((state) => ({ postAd: { ...state.postAd, uploadedMedia } })),
        setTags: (tags) =>
          set((state) => ({ postAd: { ...state.postAd, tags } })),
        setStoreId: (storeId) =>
          set((state) => ({ postAd: { ...state.postAd, storeId } })),
        setIsDraft: (isDraft) =>
          set((state) => ({ postAd: { ...state.postAd, isDraft } })),
        setAttributes: (attributes) =>
          set((state) => ({ postAd: { ...state.postAd, attributes } })),
        setAttribute: (key, value) =>
          set((state) => ({
            postAd: {
              ...state.postAd,
              attributes: { ...state.postAd.attributes, [key]: value },
            },
          })),
        resetPostAd: () =>
          set((state) => ({
            postAd: {
              ...state.postAd,
              title: "",
              description: "",
              price: null,
              categoryId: null,
              subcategoryId: null,
              condition: "New",
              location: "",
              latitude: null,
              longitude: null,
              isNegotiable: false,
              images: [],
              videos: [],
              uploadedMedia: [],
              tags: [],
              storeId: undefined,
              isDraft: false,
              attributes: {},
            },
          })),
      },
    }),
    {
      name: "app-storage",
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({
        postAd: state.postAd,
      }),
    },
  ),
);
