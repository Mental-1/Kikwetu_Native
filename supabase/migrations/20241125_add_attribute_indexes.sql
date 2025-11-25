-- Migration: Add partial indexes for frequently filtered attributes
-- Description: Creates indexes on common filter attributes for better query performance
-- Date: 2024-11-24

-- Note: PostgreSQL doesn't allow subqueries in partial index predicates
-- We'll create simpler indexes that work across all categories

-- Index for text-based attributes (make, brand, etc.)
CREATE INDEX IF NOT EXISTS idx_listings_attributes_text 
ON listings USING GIN ((attributes));

-- Index for specific common attributes
CREATE INDEX IF NOT EXISTS idx_listings_attr_make 
ON listings ((attributes->>'make'))
WHERE attributes ? 'make';

CREATE INDEX IF NOT EXISTS idx_listings_attr_brand 
ON listings ((attributes->>'brand'))
WHERE attributes ? 'brand';

CREATE INDEX IF NOT EXISTS idx_listings_attr_year 
ON listings (((attributes->>'year')::int))
WHERE attributes ? 'year';

CREATE INDEX IF NOT EXISTS idx_listings_attr_transmission 
ON listings ((attributes->>'transmission'))
WHERE attributes ? 'transmission';

CREATE INDEX IF NOT EXISTS idx_listings_attr_property_type 
ON listings ((attributes->>'property_type'))
WHERE attributes ? 'property_type';

CREATE INDEX IF NOT EXISTS idx_listings_attr_bedrooms 
ON listings (((attributes->>'bedrooms')::int))
WHERE attributes ? 'bedrooms';

-- Add comments for documentation
COMMENT ON INDEX idx_listings_attributes_text IS 'GIN index for full attribute searches';
COMMENT ON INDEX idx_listings_attr_make IS 'Index for filtering by vehicle make';
COMMENT ON INDEX idx_listings_attr_year IS 'Index for filtering by year';
COMMENT ON INDEX idx_listings_attr_property_type IS 'Index for filtering by property type';
COMMENT ON INDEX idx_listings_attr_bedrooms IS 'Index for filtering by bedrooms';

