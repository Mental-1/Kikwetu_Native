import { clearTokens, setTokens, setUserData } from "../../utils/tokenManager";
import { apiClient } from "../apiClient";
import { authService } from "../auth.service";

// Mock dependencies
jest.mock("../apiClient", () => ({
    apiClient: {
        post: jest.fn(),
        get: jest.fn(),
    },
}));

jest.mock("../../utils/tokenManager", () => ({
    setTokens: jest.fn(),
    clearTokens: jest.fn(),
    setUserData: jest.fn(),
}));

describe("AuthService", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("login", () => {
        it("should login successfully and store tokens/user", async () => {
            const mockCredentials = {
                email: "test@example.com",
                password: "password",
            };
            const mockResponse = {
                success: true,
                data: {
                    user: {
                        id: "1",
                        email: "test@example.com",
                        username: "testuser",
                        role: "user",
                    },
                    tokens: {
                        accessToken: "access",
                        refreshToken: "refresh",
                        expiresIn: 3600,
                    },
                },
            };

            (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

            const result = await authService.login(mockCredentials);

            expect(result).toEqual(mockResponse);
            expect(apiClient.post).toHaveBeenCalledWith(
                "/auth/login",
                mockCredentials,
            );
            expect(setTokens).toHaveBeenCalledWith("access", "refresh");
            expect(setUserData).toHaveBeenCalledWith(mockResponse.data.user);
        });

        it("should handle login failure", async () => {
            const mockCredentials = {
                email: "test@example.com",
                password: "wrong",
            };
            const mockResponse = {
                success: false,
                error: "Invalid credentials",
            };

            (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

            const result = await authService.login(mockCredentials);

            expect(result).toEqual(mockResponse);
            expect(setTokens).not.toHaveBeenCalled();
            expect(setUserData).not.toHaveBeenCalled();
        });

        it("should handle exceptions during login", async () => {
            (apiClient.post as jest.Mock).mockRejectedValue(
                new Error("Network error"),
            );

            const result = await authService.login({
                email: "a",
                password: "b",
            });

            expect(result).toEqual({
                success: false,
                error: "Login failed. Please try again.",
            });
        });
    });

    describe("register", () => {
        it("should register successfully", async () => {
            const mockData = {
                email: "new@example.com",
                password: "pass",
                username: "newuser",
            };
            const mockResponse = {
                success: true,
                data: {
                    user: { id: "2", ...mockData, role: "user" },
                    tokens: {
                        accessToken: "acc",
                        refreshToken: "ref",
                        expiresIn: 3600,
                    },
                },
            };

            (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

            const result = await authService.register(mockData);

            expect(result).toEqual(mockResponse);
            expect(setTokens).toHaveBeenCalled();
            expect(setUserData).toHaveBeenCalled();
        });
    });

    describe("logout", () => {
        it("should logout and clear tokens", async () => {
            (apiClient.post as jest.Mock).mockResolvedValue({ success: true });

            const result = await authService.logout();

            expect(result).toEqual({ success: true });
            expect(apiClient.post).toHaveBeenCalledWith("/auth/logout");
            expect(clearTokens).toHaveBeenCalled();
        });

        it("should clear tokens even if api call fails", async () => {
            (apiClient.post as jest.Mock).mockRejectedValue(new Error("Fail"));

            const result = await authService.logout();

            expect(result).toEqual({ success: true });
            expect(clearTokens).toHaveBeenCalled();
        });
    });
});
