-- Migration: Seed category attribute schemas
-- Description: Populates attribute_schema for all 23 categories
-- Date: 2024-11-24

-- Automobiles / Cars
UPDATE categories 
SET attribute_schema = '{
  "fields": [
    {"key": "make", "label": "Make", "type": "select", "required": true, "options": ["Toyota", "Honda", "Nissan", "Mazda", "Subaru", "Mitsubishi", "Isuzu", "Mercedes-Benz", "BMW", "Audi", "Volkswagen", "Land Rover", "Range Rover", "Peugeot", "Other"]},
    {"key": "model", "label": "Model", "type": "text", "required": true, "placeholder": "e.g., Corolla, Civic"},
    {"key": "year", "label": "Year of Manufacture", "type": "number", "required": true, "min": 1980, "max": 2025},
    {"key": "mileage", "label": "Mileage (km)", "type": "number", "required": false, "placeholder": "e.g., 50000"},
    {"key": "transmission", "label": "Transmission", "type": "select", "required": true, "options": ["Automatic", "Manual"]},
    {"key": "fuel_type", "label": "Fuel Type", "type": "select", "required": false, "options": ["Petrol", "Diesel", "Electric", "Hybrid"]},
    {"key": "body_type", "label": "Body Type", "type": "select", "required": false, "options": ["Sedan", "SUV", "Hatchback", "Pickup", "Van", "Coupe", "Wagon"]},
    {"key": "engine_size", "label": "Engine Size (cc)", "type": "number", "required": false, "placeholder": "e.g., 2000"},
    {"key": "color", "label": "Color", "type": "text", "required": false, "placeholder": "e.g., White, Black"}
  ]
}'::jsonb
WHERE LOWER(name) IN ('automobiles', 'automobile', 'cars', 'vehicles');

-- Real Estate / Property
UPDATE categories 
SET attribute_schema = '{
  "fields": [
    {"key": "property_type", "label": "Property Type", "type": "select", "required": true, "options": ["House", "Apartment", "Land", "Commercial", "Office Space", "Warehouse"]},
    {"key": "bedrooms", "label": "Bedrooms", "type": "number", "required": false, "min": 0, "max": 20},
    {"key": "bathrooms", "label": "Bathrooms", "type": "number", "required": false, "min": 0, "max": 20},
    {"key": "square_feet", "label": "Size (sq ft)", "type": "number", "required": false, "placeholder": "e.g., 1500"},
    {"key": "furnished", "label": "Furnished", "type": "select", "required": false, "options": ["Yes", "No", "Partially"]},
    {"key": "parking", "label": "Parking Spaces", "type": "number", "required": false, "min": 0, "max": 10}
  ]
}'::jsonb
WHERE LOWER(name) IN ('property', 'real estate');

-- Electronics
UPDATE categories 
SET attribute_schema = '{
  "fields": [
    {"key": "brand", "label": "Brand", "type": "text", "required": false, "placeholder": "e.g., Samsung, Apple, Sony"},
    {"key": "model", "label": "Model", "type": "text", "required": false, "placeholder": "e.g., iPhone 13, Galaxy S21"},
    {"key": "warranty", "label": "Warranty", "type": "select", "required": false, "options": ["No Warranty", "Under Warranty", "Expired Warranty"]},
    {"key": "warranty_months", "label": "Warranty Period (months)", "type": "number", "required": false, "min": 0, "max": 60}
  ]
}'::jsonb
WHERE LOWER(name) = 'electronics';

-- Phones & Tablets
UPDATE categories 
SET attribute_schema = '{
  "fields": [
    {"key": "brand", "label": "Brand", "type": "select", "required": false, "options": ["Apple", "Samsung", "Huawei", "Xiaomi", "Oppo", "Tecno", "Infinix", "Nokia", "Other"]},
    {"key": "model", "label": "Model", "type": "text", "required": false, "placeholder": "e.g., iPhone 13, Galaxy S21"},
    {"key": "storage", "label": "Storage", "type": "select", "required": false, "options": ["16GB", "32GB", "64GB", "128GB", "256GB", "512GB", "1TB"]},
    {"key": "ram", "label": "RAM", "type": "select", "required": false, "options": ["2GB", "3GB", "4GB", "6GB", "8GB", "12GB", "16GB"]},
    {"key": "warranty", "label": "Warranty", "type": "select", "required": false, "options": ["No Warranty", "Under Warranty", "Expired Warranty"]}
  ]
}'::jsonb
WHERE LOWER(name) IN ('phones & tablets', 'phones', 'tablets');

-- Fashion
UPDATE categories 
SET attribute_schema = '{
  "fields": [
    {"key": "size", "label": "Size", "type": "select", "required": false, "options": ["XS", "S", "M", "L", "XL", "XXL", "XXXL"]},
    {"key": "gender", "label": "Gender", "type": "select", "required": false, "options": ["Men", "Women", "Unisex", "Kids"]},
    {"key": "brand", "label": "Brand", "type": "text", "required": false, "placeholder": "e.g., Nike, Adidas, Zara"}
  ]
}'::jsonb
WHERE LOWER(name) = 'fashion';

-- Furniture
UPDATE categories 
SET attribute_schema = '{
  "fields": [
    {"key": "material", "label": "Material", "type": "select", "required": false, "options": ["Wood", "Metal", "Plastic", "Glass", "Fabric", "Leather"]},
    {"key": "dimensions", "label": "Dimensions (L x W x H)", "type": "text", "required": false, "placeholder": "e.g., 200cm x 100cm x 80cm"}
  ]
}'::jsonb
WHERE LOWER(name) = 'furniture';

-- Home Appliances
UPDATE categories 
SET attribute_schema = '{
  "fields": [
    {"key": "brand", "label": "Brand", "type": "text", "required": false, "placeholder": "e.g., LG, Samsung, Whirlpool"},
    {"key": "warranty", "label": "Warranty", "type": "select", "required": false, "options": ["No Warranty", "Under Warranty", "Expired Warranty"]},
    {"key": "energy_rating", "label": "Energy Rating", "type": "select", "required": false, "options": ["A+++", "A++", "A+", "A", "B", "C", "D"]}
  ]
}'::jsonb
WHERE LOWER(name) IN ('house appliances', 'home appliances');

-- Pets
UPDATE categories 
SET attribute_schema = '{
  "fields": [
    {"key": "pet_type", "label": "Pet Type", "type": "select", "required": false, "options": ["Dog", "Cat", "Bird", "Fish", "Rabbit", "Other"]},
    {"key": "breed", "label": "Breed", "type": "text", "required": false, "placeholder": "e.g., German Shepherd, Persian Cat"},
    {"key": "age", "label": "Age", "type": "text", "required": false, "placeholder": "e.g., 2 years, 6 months"}
  ]
}'::jsonb
WHERE LOWER(name) = 'pets';

-- Books
UPDATE categories 
SET attribute_schema = '{
  "fields": [
    {"key": "author", "label": "Author", "type": "text", "required": false, "placeholder": "e.g., J.K. Rowling"},
    {"key": "genre", "label": "Genre", "type": "select", "required": false, "options": ["Fiction", "Non-Fiction", "Educational", "Biography", "Self-Help", "Children", "Other"]},
    {"key": "language", "label": "Language", "type": "select", "required": false, "options": ["English", "Swahili", "French", "Other"]}
  ]
}'::jsonb
WHERE LOWER(name) = 'books';

-- Sports Equipment
UPDATE categories 
SET attribute_schema = '{
  "fields": [
    {"key": "sport_type", "label": "Sport Type", "type": "select", "required": false, "options": ["Football", "Basketball", "Tennis", "Golf", "Gym/Fitness", "Swimming", "Running", "Other"]},
    {"key": "brand", "label": "Brand", "type": "text", "required": false, "placeholder": "e.g., Nike, Adidas, Puma"}
  ]
}'::jsonb
WHERE LOWER(name) = 'sports';

-- Jobs
UPDATE categories 
SET attribute_schema = '{
  "fields": [
    {"key": "job_type", "label": "Job Type", "type": "select", "required": false, "options": ["Full-Time", "Part-Time", "Contract", "Internship", "Freelance"]},
    {"key": "experience_level", "label": "Experience Level", "type": "select", "required": false, "options": ["Entry Level", "Mid Level", "Senior Level", "Executive"]},
    {"key": "salary_range", "label": "Salary Range", "type": "text", "required": false, "placeholder": "e.g., 50,000 - 80,000 KES"}
  ]
}'::jsonb
WHERE LOWER(name) = 'jobs';

-- Services
UPDATE categories 
SET attribute_schema = '{
  "fields": [
    {"key": "service_type", "label": "Service Type", "type": "select", "required": false, "options": ["Cleaning", "Plumbing", "Electrical", "Carpentry", "Painting", "Moving", "Tutoring", "Other"]},
    {"key": "availability", "label": "Availability", "type": "select", "required": false, "options": ["Weekdays", "Weekends", "Anytime"]}
  ]
}'::jsonb
WHERE LOWER(name) = 'services';

-- Baby Items
UPDATE categories 
SET attribute_schema = '{
  "fields": [
    {"key": "age_range", "label": "Age Range", "type": "select", "required": false, "options": ["0-6 months", "6-12 months", "1-2 years", "2-3 years", "3+ years"]},
    {"key": "gender", "label": "Gender", "type": "select", "required": false, "options": ["Boy", "Girl", "Unisex"]}
  ]
}'::jsonb
WHERE LOWER(name) IN ('baby', 'baby items');

-- Toys
UPDATE categories 
SET attribute_schema = '{
  "fields": [
    {"key": "age_range", "label": "Recommended Age", "type": "select", "required": false, "options": ["0-2 years", "3-5 years", "6-8 years", "9-12 years", "13+ years"]},
    {"key": "brand", "label": "Brand", "type": "text", "required": false, "placeholder": "e.g., LEGO, Barbie"}
  ]
}'::jsonb
WHERE LOWER(name) = 'toys';

-- Games
UPDATE categories 
SET attribute_schema = '{
  "fields": [
    {"key": "platform", "label": "Platform", "type": "select", "required": false, "options": ["PlayStation", "Xbox", "Nintendo Switch", "PC", "Mobile", "Board Game"]},
    {"key": "genre", "label": "Genre", "type": "select", "required": false, "options": ["Action", "Adventure", "RPG", "Sports", "Racing", "Strategy", "Puzzle"]}
  ]
}'::jsonb
WHERE LOWER(name) = 'games';

-- Music Instruments
UPDATE categories 
SET attribute_schema = '{
  "fields": [
    {"key": "instrument_type", "label": "Instrument Type", "type": "select", "required": false, "options": ["Guitar", "Piano/Keyboard", "Drums", "Violin", "Saxophone", "Trumpet", "Other"]},
    {"key": "brand", "label": "Brand", "type": "text", "required": false, "placeholder": "e.g., Yamaha, Fender"}
  ]
}'::jsonb
WHERE LOWER(name) = 'music';

-- Art
UPDATE categories 
SET attribute_schema = '{
  "fields": [
    {"key": "art_type", "label": "Art Type", "type": "select", "required": false, "options": ["Painting", "Sculpture", "Photography", "Digital Art", "Handcraft", "Other"]},
    {"key": "dimensions", "label": "Dimensions", "type": "text", "required": false, "placeholder": "e.g., 50cm x 70cm"}
  ]
}'::jsonb
WHERE LOWER(name) = 'art';

-- Beauty Products
UPDATE categories 
SET attribute_schema = '{
  "fields": [
    {"key": "product_type", "label": "Product Type", "type": "select", "required": false, "options": ["Skincare", "Makeup", "Haircare", "Fragrance", "Nails", "Other"]},
    {"key": "brand", "label": "Brand", "type": "text", "required": false, "placeholder": "e.g., LOreal, Nivea"}
  ]
}'::jsonb
WHERE LOWER(name) = 'beauty';

-- Health & Wellness
UPDATE categories 
SET attribute_schema = '{
  "fields": [
    {"key": "product_type", "label": "Product Type", "type": "select", "required": false, "options": ["Supplements", "Fitness Equipment", "Medical Devices", "Personal Care", "Other"]},
    {"key": "brand", "label": "Brand", "type": "text", "required": false, "placeholder": "e.g., GNC, Fitbit"}
  ]
}'::jsonb
WHERE LOWER(name) = 'health';

-- Garden & Outdoor
UPDATE categories 
SET attribute_schema = '{
  "fields": [
    {"key": "item_type", "label": "Item Type", "type": "select", "required": false, "options": ["Plants", "Tools", "Furniture", "Decor", "Equipment", "Other"]}
  ]
}'::jsonb
WHERE LOWER(name) = 'garden';

-- Hobbies & Crafts
UPDATE categories 
SET attribute_schema = '{
  "fields": [
    {"key": "hobby_type", "label": "Hobby Type", "type": "select", "required": false, "options": ["Painting", "Knitting", "Woodworking", "Photography", "Collecting", "Other"]}
  ]
}'::jsonb
WHERE LOWER(name) = 'hobbies';

-- Tools
UPDATE categories 
SET attribute_schema = '{
  "fields": [
    {"key": "tool_type", "label": "Tool Type", "type": "select", "required": false, "options": ["Power Tools", "Hand Tools", "Garden Tools", "Automotive Tools", "Other"]},
    {"key": "brand", "label": "Brand", "type": "text", "required": false, "placeholder": "e.g., Bosch, DeWalt"}
  ]
}'::jsonb
WHERE LOWER(name) = 'tools';

-- Jewelry & Accessories
UPDATE categories 
SET attribute_schema = '{
  "fields": [
    {"key": "jewelry_type", "label": "Type", "type": "select", "required": false, "options": ["Necklace", "Ring", "Bracelet", "Earrings", "Watch", "Other"]},
    {"key": "material", "label": "Material", "type": "select", "required": false, "options": ["Gold", "Silver", "Platinum", "Stainless Steel", "Leather", "Other"]}
  ]
}'::jsonb
WHERE LOWER(name) = 'jewelry';

-- Food & Beverages (if applicable)
UPDATE categories 
SET attribute_schema = '{
  "fields": [
    {"key": "food_type", "label": "Food Type", "type": "select", "required": false, "options": ["Fresh Produce", "Packaged Foods", "Beverages", "Baked Goods", "Other"]},
    {"key": "expiry_date", "label": "Expiry Date", "type": "text", "required": false, "placeholder": "e.g., 2024-12-31"}
  ]
}'::jsonb
WHERE LOWER(name) = 'food';
