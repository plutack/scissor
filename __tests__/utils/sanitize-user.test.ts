import sanitizeUser from "@/utils/sanitize-user";
import { db } from "@/lib/db";
import { User } from "@prisma/client";

// Mock the db module
jest.mock("@/lib/db", () => ({
  db: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

describe("sanitizeUser", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return null if user is not found", async () => {
    (db.user.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await sanitizeUser("nonexistent@example.com");
    expect(result).toBeNull();
    expect(db.user.findUnique).toHaveBeenCalledWith({
      where: { email: "nonexistent@example.com" },
    });
  });

  it("should return sanitized user data if user is found", async () => {
    const mockUser: User = {
      id: "1",
      name: "Test User",
      email: "test@example.com",
      emailVerified: null,
      password: "hashedpassword",
      role: "USER",
      image: "profile.jpg",
      totalClicks: 0,
      uniqueCountryCount: 0,
    };

    (db.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

    const result = await sanitizeUser("test@example.com");
    expect(result).toEqual({
      id: "1",
      name: "Test User",
      email: "test@example.com",
      emailVerified: null,
      role: "USER",
      totalClicks: 0,
      uniqueCountryCount: 0,
    });
    expect(result).not.toHaveProperty("password");
    expect(result).not.toHaveProperty("image");
    expect(db.user.findUnique).toHaveBeenCalledWith({
      where: { email: "test@example.com" },
    });
  });

  it("should handle errors from db", async () => {
    (db.user.findUnique as jest.Mock).mockRejectedValue(
      new Error("Database error"),
    );

    await expect(sanitizeUser("error@example.com")).rejects.toThrow(
      "Database error",
    );
    expect(db.user.findUnique).toHaveBeenCalledWith({
      where: { email: "error@example.com" },
    });
  });
});
