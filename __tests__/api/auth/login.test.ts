import { POST } from "@/app/api/auth/login/route";
import { loginSchema } from "@/schemas";
import { signIn } from "@/auth";
import { cookies } from "next/headers";
import { sanitizeUser } from "@/services/user-service";
import rateLimitIP from "@/utils/rate-limit";
import ErrorWithStatus from "@/exception/custom-error";
import { AuthError } from "next-auth";

// Mock dependencies
jest.mock("@/schemas", () => ({
  loginSchema: {
    safeParse: jest.fn(),
  },
}));
jest.mock("@/auth", () => ({
  signIn: jest.fn(),
}));
jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));
jest.mock("@/services/user-service", () => ({
  sanitizeUser: jest.fn(),
}));
jest.mock("@/utils/rate-limit", () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(undefined),
}));

describe("POST /api/auth/login", () => {
  const mockRequest = (body: any) =>
    ({
      json: jest.fn().mockResolvedValue(body),
    }) as unknown as Request;

  const mockResponse = {} as Response;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 if fields are invalid", async () => {
    const req = mockRequest({ email: "invalid-email", password: "123" });
    (loginSchema.safeParse as jest.Mock).mockReturnValue({ success: false });

    const res = await POST(req, mockResponse);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data).toEqual({ success: false, error: "Invalid fields" });
  });

  it("should return 401 if credentials are invalid", async () => {
    const req = mockRequest({
      email: "test@example.com",
      password: "password123",
    });
    (loginSchema.safeParse as jest.Mock).mockReturnValue({
      success: true,
      data: { email: "test@example.com", password: "password123" },
    });
    (signIn as jest.Mock).mockRejectedValue(
      new AuthError("Invalid credentials"),
    );
    (rateLimitIP as jest.Mock).mockResolvedValue(undefined); //

    const res = await POST(req, mockResponse);
    const data = await res.json();

    expect(res.status).toBe(401);
    console.log(data);
    expect(data).toEqual({ success: false, error: "Invalid credentials" });
  });

  it("should return 200 and user data if login is successful", async () => {
    const req = mockRequest({
      email: "test@example.com",
      password: "password123",
    });
    const mockUser = { id: "1", name: "Test User" };
    const mockAccessToken = "mock-access-token";

    (loginSchema.safeParse as jest.Mock).mockReturnValue({
      success: true,
      data: { email: "test@example.com", password: "password123" },
    });
    (signIn as jest.Mock).mockResolvedValue(undefined);
    (sanitizeUser as jest.Mock).mockResolvedValue(mockUser);
    (cookies as jest.Mock).mockReturnValue({
      get: jest.fn().mockReturnValue({ value: mockAccessToken }),
    });

    const res = await POST(req, mockResponse);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual({
      success: true,
      accessToken: mockAccessToken,
      user: mockUser,
    });
  });

  it("should return 429 if rate limit is exceeded", async () => {
    const req = mockRequest({
      email: "test@example.com",
      password: "password123",
    });
    (rateLimitIP as jest.Mock).mockRejectedValue(
      new ErrorWithStatus("Rate limit exceeded", 429),
    );

    const res = await POST(req, mockResponse);
    const data = await res.json();

    expect(res.status).toBe(429);
    expect(data).toEqual({ success: false, error: "Rate limit exceeded" });
  });

  it("should return 500 for unexpected errors", async () => {
    const req = mockRequest({
      email: "test@example.com",
      password: "password123",
    });
    (loginSchema.safeParse as jest.Mock).mockReturnValue({
      success: true,
      data: { email: "test@example.com", password: "password123" },
    });
    (signIn as jest.Mock).mockRejectedValue(new Error("Unexpected error"));
    (rateLimitIP as jest.Mock).mockResolvedValue(undefined); //

    const res = await POST(req, mockResponse);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data).toEqual({
      success: false,
      error: "An unexpected error occurred",
    });
  });
});
