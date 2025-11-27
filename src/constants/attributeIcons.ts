import { Ionicons } from "@expo/vector-icons";
import { ComponentProps } from "react";

type IoniconsName = ComponentProps<typeof Ionicons>["name"];

export const ATTRIBUTE_ICONS: Record<string, IoniconsName> = {
    // Automobiles
    make: "car-outline",
    model: "car-sport-outline",
    year: "calendar-outline",
    mileage: "speedometer-outline",
    transmission: "settings-outline",
    fuel_type: "flash-outline",
    body_type: "cube-outline",
    engine_size: "hardware-chip-outline",
    color: "color-palette-outline",

    // Property
    property_type: "home-outline",
    bedrooms: "bed-outline",
    bathrooms: "water-outline",
    square_feet: "resize-outline",
    furnished: "bed-outline",
    parking: "car-outline",

    // Phones & Tablets / Electronics
    brand: "pricetag-outline",
    storage: "save-outline",
    ram: "hardware-chip-outline",
    warranty: "shield-checkmark-outline",
    warranty_months: "time-outline",

    // Fashion
    size: "resize-outline",
    gender: "people-outline",

    // Furniture
    material: "hammer-outline",
    dimensions: "resize-outline",

    // Pets
    pet_type: "paw-outline",
    breed: "paw-outline",
    age: "time-outline",

    // Books
    author: "person-outline",
    genre: "book-outline",
    language: "language-outline",

    // Art
    art_type: "brush-outline",

    // Food
    food_type: "fast-food-outline",
    expiry_date: "calendar-outline",

    // Jobs
    job_type: "briefcase-outline",
    experience_level: "trending-up-outline",
    salary_range: "cash-outline",


    service_type: "construct-outline",
    availability: "calendar-outline",

    platform: "game-controller-outline",
    product_type: "fitness-outline",
    energy_rating: "battery-charging-outline",
    sport_type: "football-outline",

    jewelry_type: "diamond-outline",

    tool_type: "construct-outline",

    age_range: "happy-outline",

    instrument_type: "musical-notes-outline",

    item_type: "leaf-outline",

    default: "information-circle-outline",
};

/**
 * Get the appropriate icon for an attribute key
 * @param key The attribute key (e.g., 'make', 'bedrooms', 'brand')
 * @returns Ionicons name for the attribute
 */
export function getAttributeIcon(key: string): IoniconsName {
    return ATTRIBUTE_ICONS[key] || ATTRIBUTE_ICONS.default;
}
