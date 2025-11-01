export const Colors = {
  primary: '#1461BD',
  black: '#030303',
  grey: '#666',
  lightgrey: '#999',
  white: '#fff',
  background: '#F4F4F4',
  highlight: '#F4CE14',
  red: '#ed0707',
  green: '#22c55e',
  badgeRed: '#ff4444',
};
export type Color = keyof typeof Colors;

export const categoryIcons: { [key: string]: any } = {
  'default': require('../../assets/images/categories/electronics.png'),
  'baby': require('../../assets/images/categories/baby.png'),
  'baby items': require('../../assets/images/categories/baby.png'),
  'beauty': require('../../assets/images/categories/beauty.png'),
  'books': require('../../assets/images/categories/books.png'),
  'electronics': require('../../assets/images/categories/electronics.png'),
  'fashion': require('../../assets/images/categories/fashion.png'),
  'food': require('../../assets/images/categories/food.png'),
  'furniture': require('../../assets/images/categories/furniture.png'),
  'games': require('../../assets/images/categories/games.png'),
  'garden': require('../../assets/images/categories/garden.png'),
  'health': require('../../assets/images/categories/health.png'),
  'hobbies': require('../../assets/images/categories/hobbies.png'),
  'house appliances': require('../../assets/images/categories/house_appliances.png'),
  'home appliances': require('../../assets/images/categories/house_appliances.png'),
  'jewelry': require('../../assets/images/categories/jewelry.png'),
  'jobs': require('../../assets/images/categories/jobs.png'),
  'music': require('../../assets/images/categories/music.png'),
  'pets': require('../../assets/images/categories/pets.png'),
  'phones & tablets': require('../../assets/images/categories/phones_tablets.png'),
  'phones': require('../../assets/images/categories/phones_tablets.png'),
  'property': require('../../assets/images/categories/property.png'),
  'real estate': require('../../assets/images/categories/property.png'),
  'services': require('../../assets/images/categories/services.png'),
  'sports': require('../../assets/images/categories/sports.png'),
  'tools': require('../../assets/images/categories/tools.png'),
  'toys': require('../../assets/images/categories/toys.png'),
};

export const getCategoryImage = (categoryName: string): any => {
  const normalizedName = categoryName.toLowerCase().trim();
  return categoryIcons[normalizedName] || categoryIcons['default'];
};