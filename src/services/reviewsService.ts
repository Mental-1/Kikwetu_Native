import { Review } from "@/src/types/api.types";

const MOCK_REVIEWS: Review[] = [
    {
        id: "1",
        reviewerName: "John Doe",
        avatar: "https://i.pravatar.cc/150?u=1",
        rating: 4,
        comment:
            "Great seller! The item was exactly as described and in perfect condition. Would definitely buy from them again.",
        date: "1 month ago",
    },
    {
        id: "2",
        reviewerName: "Sarah Smith",
        avatar: "https://i.pravatar.cc/150?u=2",
        rating: 5,
        comment:
            "Fast shipping and excellent communication. Highly recommended!",
        date: "2 months ago",
    },
    {
        id: "3",
        reviewerName: "Mike Johnson",
        avatar: "https://i.pravatar.cc/150?u=3",
        rating: 3,
        comment: "Item was okay, but shipping took longer than expected.",
        date: "3 months ago",
    },
    {
        id: "4",
        reviewerName: "Emily Davis",
        avatar: "https://i.pravatar.cc/150?u=4",
        rating: 5,
        comment: "Absolutely love it! Thanks so much.",
        date: "4 months ago",
    },
];

export const getListingReviews = async (
    listingId: string,
): Promise<Review[]> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Return mock data
    return MOCK_REVIEWS;
};
