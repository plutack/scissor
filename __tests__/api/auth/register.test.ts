import { POST } from "@/app/api/auth/register/route";
import { registerSchema } from "@/schemas";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { getUserByEmail } from "@/services/user-service";
import rateLimitIP from "@/utils/rate-limit";
import ErrorWithStatus from "@/exception/custom-error";

// Mock dependencies
jest.mock("@/schemas", () => ({
  registerSchema: {
    safeParse: jest.fn(),
  },
}));
jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
}));
jest.mock("@/lib/db", () => ({
  db: {
    user: {
      create: jest.fn(),
    },
  },
}));
jest.mock("@/services/user-service", () => ({
  getUserByEmail: jest.fn(),
}));
jest.mock("@/utils/rate-limit", () => jest.fn());

describe("POST /api/auth/register", () => {
  const mockRequest = (body: any) =>
    ({
      json: jest.fn().mockResolvedValue(body),
    }) as unknown as Request;

  beforeEach(() => {
    jest.clearAllMocks();
    (rateLimitIP as jest.Mock).mockResolvedValue(undefined);
  });

  it("should return 400 if fields are invalid", async () => {
    const req = mockRequest({
      name: "Test User",
      email: "invalid-email",
      password: "123",
    });
    (registerSchema.safeParse as jest.Mock).mockReturnValue({ success: false });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data).toEqual({ success: false, error: "Invalid fields" });
  });

  it("should return 409 if email is already in use", async () => {
    const req = mockRequest({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    });
    (registerSchema.safeParse as jest.Mock).mockReturnValue({
      success: true,
      data: {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      },
    });
    (getUserByEmail as jest.Mock).mockResolvedValue({
      id: "1",
      email: "test@example.com",
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(409);
    expect(data).toEqual({ success: false, error: "email already in use" });
  });

  it("should return 201 and create user if registration is successful", async () => {
    const req = mockRequest({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    });
    (registerSchema.safeParse as jest.Mock).mockReturnValue({
      success: true,
      data: {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      },
    });
    (getUserByEmail as jest.Mock).mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashed_password");
    (db.user.create as jest.Mock).mockResolvedValue({
      id: "1",
      name: "Test User",
      email: "test@example.com",
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data).toEqual({ success: true, message: "Registration successful" });
    expect(db.user.create).toHaveBeenCalledWith({
      data: {
        name: "Test User",
        email: "test@example.com",
        password: "hashed_password",
      },
    });
  });

  it("should return 429 if rate limit is exceeded", async () => {
    const req = mockRequest({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    });
    (rateLimitIP as jest.Mock).mockRejectedValue(
      new ErrorWithStatus("Rate limit exceeded", 429),
    );

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(429);
    expect(data).toEqual({ success: false, error: "Rate limit exceeded" });
  });

  it("should return 500 for unexpected errors", async () => {
    const req = mockRequest({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    });
    (registerSchema.safeParse as jest.Mock).mockReturnValue({
      success: true,
      data: {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      },
    });
    (getUserByEmail as jest.Mock).mockRejectedValue(
      new Error("Database error"),
    );

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data).toEqual({ success: false, error: "Internal server error" });
  });
});
