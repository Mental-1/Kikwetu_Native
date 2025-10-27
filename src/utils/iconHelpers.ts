import { Ionicons } from '@expo/vector-icons';

type IconName = keyof typeof Ionicons.glyphMap;

export const getIconFromEmoji = (emoji: string): IconName => {
    const iconMap: { [key: string]: IconName } = {
        '🎨': 'color-palette-outline',
        '🚗': 'car-outline',
        '🍼': 'nutrition-outline',
        '💄': 'woman-outline',
        '📚': 'book-outline',
        '💻': 'laptop-outline',
        '👗': 'shirt-outline',
        '🍕': 'restaurant-outline',
        '🏠': 'home-outline',
        '📱': 'phone-portrait-outline',
        '🎵': 'musical-notes-outline',
        '⚽': 'football-outline',
    };
    return iconMap[emoji] || 'grid-outline';
};