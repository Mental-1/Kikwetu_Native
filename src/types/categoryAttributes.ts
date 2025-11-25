/** Category Attribute Types */

export interface AttributeField {
    key: string;
    label: string;
    type: "text" | "number" | "select" | "boolean";
    required: boolean;
    options?: string[];
    min?: number;
    max?: number;
    placeholder?: string;
    helpText?: string;
}

export interface AttributeSchema {
    fields: AttributeField[];
}

export interface CategoryWithSchema {
    id: number;
    name: string;
    icon?: string;
    attribute_schema?: AttributeSchema;
}

export interface CarAttributes {
    make: string;
    model: string;
    year: number;
    mileage?: number;
    transmission: "Automatic" | "Manual";
    fuel_type?: "Petrol" | "Diesel" | "Electric" | "Hybrid";
    body_type?:
        | "Sedan"
        | "SUV"
        | "Hatchback"
        | "Pickup"
        | "Van"
        | "Coupe"
        | "Wagon";
    engine_size?: number;
    color?: string;
}

// Real Estate / Property
export interface RealEstateAttributes {
    property_type:
        | "House"
        | "Apartment"
        | "Land"
        | "Commercial"
        | "Office Space"
        | "Warehouse";
    bedrooms?: number;
    bathrooms?: number;
    square_feet?: number;
    furnished?: "Yes" | "No" | "Partially";
    parking?: number;
}

export interface ElectronicsAttributes {
    brand?: string;
    model?: string;
    warranty?: "No Warranty" | "Under Warranty" | "Expired Warranty";
    warranty_months?: number;
}

export interface PhoneAttributes {
    brand?:
        | "Apple"
        | "Samsung"
        | "Huawei"
        | "Xiaomi"
        | "Oppo"
        | "Tecno"
        | "Infinix"
        | "Nokia"
        | "Other";
    model?: string;
    storage?: "16GB" | "32GB" | "64GB" | "128GB" | "256GB" | "512GB" | "1TB";
    ram?: "2GB" | "3GB" | "4GB" | "6GB" | "8GB" | "12GB" | "16GB";
    warranty?: "No Warranty" | "Under Warranty" | "Expired Warranty";
}

export interface FashionAttributes {
    size?: "XS" | "S" | "M" | "L" | "XL" | "XXL" | "XXXL";
    gender?: "Men" | "Women" | "Unisex" | "Kids";
    brand?: string;
}

export interface FurnitureAttributes {
    material?: "Wood" | "Metal" | "Plastic" | "Glass" | "Fabric" | "Leather";
    dimensions?: string;
}

export interface HomeApplianceAttributes {
    brand?: string;
    warranty?: "No Warranty" | "Under Warranty" | "Expired Warranty";
    energy_rating?: "A+++" | "A++" | "A+" | "A" | "B" | "C" | "D";
}

export interface PetAttributes {
    pet_type?: "Dog" | "Cat" | "Bird" | "Fish" | "Rabbit" | "Other";
    breed?: string;
    age?: string;
}

export interface BookAttributes {
    author?: string;
    genre?:
        | "Fiction"
        | "Non-Fiction"
        | "Educational"
        | "Biography"
        | "Self-Help"
        | "Children"
        | "Other";
    language?: "English" | "Swahili" | "French" | "Other";
}

export interface SportsAttributes {
    sport_type?:
        | "Football"
        | "Basketball"
        | "Tennis"
        | "Golf"
        | "Gym/Fitness"
        | "Swimming"
        | "Running"
        | "Other";
    brand?: string;
}

export interface JobAttributes {
    job_type?:
        | "Full-Time"
        | "Part-Time"
        | "Contract"
        | "Internship"
        | "Freelance";
    experience_level?:
        | "Entry Level"
        | "Mid Level"
        | "Senior Level"
        | "Executive";
    salary_range?: string;
}

export interface ServiceAttributes {
    service_type?:
        | "Cleaning"
        | "Plumbing"
        | "Electrical"
        | "Carpentry"
        | "Painting"
        | "Moving"
        | "Tutoring"
        | "Other";
    availability?: "Weekdays" | "Weekends" | "Anytime";
}

export interface BabyItemAttributes {
    age_range?:
        | "0-6 months"
        | "6-12 months"
        | "1-2 years"
        | "2-3 years"
        | "3+ years";
    gender?: "Boy" | "Girl" | "Unisex";
}

export interface ToyAttributes {
    age_range?:
        | "0-2 years"
        | "3-5 years"
        | "6-8 years"
        | "9-12 years"
        | "13+ years";
    brand?: string;
}

export interface GameAttributes {
    platform?:
        | "PlayStation"
        | "Xbox"
        | "Nintendo Switch"
        | "PC"
        | "Mobile"
        | "Board Game";
    genre?:
        | "Action"
        | "Adventure"
        | "RPG"
        | "Sports"
        | "Racing"
        | "Strategy"
        | "Puzzle";
}

export interface MusicAttributes {
    instrument_type?:
        | "Guitar"
        | "Piano/Keyboard"
        | "Drums"
        | "Violin"
        | "Saxophone"
        | "Trumpet"
        | "Other";
    brand?: string;
}

export interface ArtAttributes {
    art_type?:
        | "Painting"
        | "Sculpture"
        | "Photography"
        | "Digital Art"
        | "Handcraft"
        | "Other";
    dimensions?: string;
}

export interface BeautyAttributes {
    product_type?:
        | "Skincare"
        | "Makeup"
        | "Haircare"
        | "Fragrance"
        | "Nails"
        | "Other";
    brand?: string;
}

export interface HealthAttributes {
    product_type?:
        | "Supplements"
        | "Fitness Equipment"
        | "Medical Devices"
        | "Personal Care"
        | "Other";
    brand?: string;
}

export interface GardenAttributes {
    item_type?:
        | "Plants"
        | "Tools"
        | "Furniture"
        | "Decor"
        | "Equipment"
        | "Other";
}

export interface HobbyAttributes {
    hobby_type?:
        | "Painting"
        | "Knitting"
        | "Woodworking"
        | "Photography"
        | "Collecting"
        | "Other";
}

export interface ToolAttributes {
    tool_type?:
        | "Power Tools"
        | "Hand Tools"
        | "Garden Tools"
        | "Automotive Tools"
        | "Other";
    brand?: string;
}

export interface JewelryAttributes {
    jewelry_type?:
        | "Necklace"
        | "Ring"
        | "Bracelet"
        | "Earrings"
        | "Watch"
        | "Other";
    material?:
        | "Gold"
        | "Silver"
        | "Platinum"
        | "Stainless Steel"
        | "Leather"
        | "Other";
}

export interface FoodAttributes {
    food_type?:
        | "Fresh Produce"
        | "Packaged Foods"
        | "Beverages"
        | "Baked Goods"
        | "Other";
    expiry_date?: string;
}

export type ListingAttributes =
    | CarAttributes
    | RealEstateAttributes
    | ElectronicsAttributes
    | PhoneAttributes
    | FashionAttributes
    | FurnitureAttributes
    | HomeApplianceAttributes
    | PetAttributes
    | BookAttributes
    | SportsAttributes
    | JobAttributes
    | ServiceAttributes
    | BabyItemAttributes
    | ToyAttributes
    | GameAttributes
    | MusicAttributes
    | ArtAttributes
    | BeautyAttributes
    | HealthAttributes
    | GardenAttributes
    | HobbyAttributes
    | ToolAttributes
    | JewelryAttributes
    | FoodAttributes
    | Record<string, any>;

export function validateAttributesSize(
    attributes: Record<string, any>,
): boolean {
    const size = JSON.stringify(attributes).length;
    return size <= 1024;
}

export function getCategoryAttributeSchema(
    category: CategoryWithSchema,
): AttributeSchema | null {
    return category.attribute_schema || null;
}
