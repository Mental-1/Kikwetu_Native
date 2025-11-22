import {
    getAccessToken,
    getRefreshToken,
    setTokens,
} from "../../utils/tokenManager";
import { apiClient } from "../apiClient";

// Mock the token manager
jest.mock("../../utils/tokenManager", () => ({
    getAccessToken: jest.fn(),
    getRefreshToken: jest.fn(),
    setTokens: jest.fn(),
    clearTokens: jest.fn(),
}));

// Mock global fetch
global.fetch = jest.fn();

describe("ApiClient", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (global.fetch as jest.Mock).mockClear();
    });

    describe("getAuthHeaders", () => {
        it("should return headers with token when available", async () => {
            (getAccessToken as jest.Mock).mockResolvedValue("fake-token");

            // Access private method via any cast or test public methods that use it
            // Since we can't easily access private methods, we'll test via a public method
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                text: () => Promise.resolve("{}"),
                json: () => Promise.resolve({}),
            });

            await apiClient.get("/test");

            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining("/test"),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        "Authorization": "Bearer fake-token",
                        "Content-Type": "application/json",
                    }),
                }),
            );
        });

        it("should return headers without token when not available", async () => {
            (getAccessToken as jest.Mock).mockResolvedValue(null);

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                text: () => Promise.resolve("{}"),
                json: () => Promise.resolve({}),
            });

            await apiClient.get("/test");

            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining("/test"),
                expect.objectContaining({
                    headers: expect.not.objectContaining({
                        "Authorization": expect.anything(),
                    }),
                }),
            );
        });
    });

    describe("get", () => {
        it("should make a GET request and return data", async () => {
            const mockResponse = { success: true, data: { id: 1 } };
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                text: () => Promise.resolve(JSON.stringify(mockResponse)),
                json: () => Promise.resolve(mockResponse),
            });

            await apiClient.get("/items", { page: 1, sort: "asc" });

            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining("/items?page=1&sort=asc"),
                expect.anything(),
            );
        });
    });

    describe("post", () => {
        it("should make a POST request with body", async () => {
            const mockData = { name: "New Item" };
            const mockResponse = {
                success: true,
                data: { id: 1, ...mockData },
            };

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                text: () => Promise.resolve(JSON.stringify(mockResponse)),
                json: () => Promise.resolve(mockResponse),
            });

            const result = await apiClient.post("/items", mockData);

            expect(result).toEqual(mockResponse);
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining("/items"),
                expect.objectContaining({
                    method: "POST",
                    body: JSON.stringify(mockData),
                }),
            );
        });
    });

    describe("Error Handling", () => {
        it("should handle 401 and attempt refresh", async () => {
            // First call fails with 401
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                status: 401,
                statusText: "Unauthorized",
                text: () =>
                    Promise.resolve(JSON.stringify({ error: "token_expired" })),
            });

            // Mock refresh token availability
            (getRefreshToken as jest.Mock).mockResolvedValue("refresh-token");

            // Mock refresh endpoint success
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: () =>
                    Promise.resolve({
                        success: true,
                        data: { accessToken: "new-access-token" },
                    }),
            });

            const result = await apiClient.get("/protected");

            // The current implementation returns a specific error on refresh
            expect(result).toEqual({
                success: false,
                error: "Token refreshed. Please retry the request.",
            });

            expect(setTokens).toHaveBeenCalledWith(
                "new-access-token",
                "refresh-token",
            );
        });

        it("should handle network errors", async () => {
            (global.fetch as jest.Mock).mockRejectedValue(
                new Error("Network error"),
            );

            const result = await apiClient.get("/items");

            expect(result).toEqual({
                success: false,
                error: "network_error",
                message:
                    "Could not connect to the server. Please check your internet connection.",
            });
        });
    });
});
