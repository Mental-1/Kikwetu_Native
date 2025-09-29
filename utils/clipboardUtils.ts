import * as Clipboard from 'expo-clipboard';

/**
 * Copy text to clipboard
 * @param text - The text to copy to clipboard
 * @returns Promise<boolean> - Success status
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (!text || text.trim().length === 0) {
      throw new Error('No text to copy');
    }

    await Clipboard.setStringAsync(text.trim());
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

/**
 * Get text from clipboard
 * @returns Promise<string> - The text from clipboard
 */
export const getFromClipboard = async (): Promise<string> => {
  try {
    const text = await Clipboard.getStringAsync();
    return text;
  } catch (error) {
    console.error('Failed to get text from clipboard:', error);
    return '';
  }
};

/**
 * Check if clipboard has text content
 * @returns Promise<boolean> - Whether clipboard has text
 */
export const hasClipboardContent = async (): Promise<boolean> => {
  try {
    const text = await Clipboard.getStringAsync();
    return text.length > 0;
  } catch (error) {
    console.error('Failed to check clipboard content:', error);
    return false;
  }
};

/**
 * Clear clipboard content
 * @returns Promise<boolean> - Success status
 */
export const clearClipboard = async (): Promise<boolean> => {
  try {
    await Clipboard.setStringAsync('');
    return true;
  } catch (error) {
    console.error('Failed to clear clipboard:', error);
    return false;
  }
};
