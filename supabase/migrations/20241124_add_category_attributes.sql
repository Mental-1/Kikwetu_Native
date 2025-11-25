-- Migration: Add dynamic category attributes support
-- Description: Adds attributes JSONB column to listings table and attribute_schema to categories table
-- Date: 2024-11-24

-- Add attributes column to listings table
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS attributes JSONB DEFAULT '{}'::jsonb;

-- Add GIN index for efficient querying of attributes
CREATE INDEX IF NOT EXISTS idx_listings_attributes ON listings USING GIN (attributes);

-- Add attribute_schema column to categories table
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS attribute_schema JSONB DEFAULT '{}'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN listings.attributes IS 'Category-specific attributes stored as flat JSONB (e.g., car make, mileage, year)';
COMMENT ON COLUMN categories.attribute_schema IS 'Schema definition for category-specific attributes';
