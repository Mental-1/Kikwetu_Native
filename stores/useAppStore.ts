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
  offerDelivery: boolean;
  images: string[];
  videos: string[];
  uploadedMedia: { uri: string; id: string; type: "image" | "video" }[];
  tags: string[];
  storeId?: string;
  isDraft: boolean;
  attributes: Record<string, any>;
  setField: <
    K extends keyof Omit<PostAdState, "setField" | "setFormData" | "resetForm">,
  >(
    field: K,
    value: PostAdState[K],
  ) => void;
  setFormData: (
    data: Partial<Omit<PostAdState, "setField" | "setFormData" | "resetForm">>,
  ) => void;
  resetForm: () => void;
}

interface AppState {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  postAd: PostAdState;
}

const initialPostAdState: Omit<
  PostAdState,
  "setField" | "setFormData" | "resetForm"
> = {
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
  offerDelivery: false,
  images: [],
  videos: [],
  uploadedMedia: [],
  tags: [],
  storeId: undefined,
  isDraft: false,
  attributes: {},
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      searchQuery: "",
      setSearchQuery: (query) => set({ searchQuery: query }),

      postAd: {
        ...initialPostAdState,

        setField: (field, value) =>
          set((state) => ({
            postAd: {
              ...state.postAd,
              [field]: value,
            },
          })),

        setFormData: (data) =>
          set((state) => ({
            postAd: {
              ...state.postAd,
              ...data,
            },
          })),

        resetForm: () =>
          set((state) => ({
            postAd: {
              ...state.postAd,
              ...initialPostAdState,
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
