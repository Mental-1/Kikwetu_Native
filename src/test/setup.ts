import mockAsyncStorage from "@react-native-async-storage/async-storage/jest/async-storage-mock";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => mockAsyncStorage);

// Mock other native modules if needed
jest.mock("expo-secure-store", () => ({
    setItemAsync: jest.fn(),
    getItemAsync: jest.fn(),
    deleteItemAsync: jest.fn(),
}));

// Mock console.error to keep test output clean (optional, but good for expected errors)
// const originalConsoleError = console.error;
// console.error = (...args) => {
//   if (args[0]?.includes('Warning:')) return;
//   originalConsoleError(...args);
// };
