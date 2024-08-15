import {
  getUserStats,
  sanitizeUser,
  getUserByEmail,
} from "@/services/user-service";
import { db } from "@/lib/db";
import { User } from "@prisma/client";
import ErrorWithStatus from "@/exception/custom-error";

jest.mock("@/lib/db", () => ({
  db: {
    user: {
      findUnique: jest.fn(),
    },
    link: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    visit: {
      findMany: jest.fn(),
    },
  },
}));

describe("User Service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getUserStats", () => {
    it("should return user stats", async () => {
      const mockUser = {
        id: "user123",
        email: "test@example.com",
        name: "Test User",
      };
      const mockLinks = [
        { link: "http://example.com" },
        { link: "http://test.com" },
      ];
      const mockLastFiveLinks = [
        { link: "http://example.com", customSuffix: "abc" },
        { link: "http://test.com", customSuffix: "def" },
      ];
      const mockTopCountries = [
        { country: "US", count: 10 },
        { country: "UK", count: 5 },
      ];

      (db.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (db.link.count as jest.Mock).mockResolvedValue(5);
      (db.link.findMany as jest.Mock)
        .mockResolvedValueOnce(mockLinks)
        .mockResolvedValueOnce(mockLastFiveLinks);
      (db.visit.findMany as jest.Mock).mockResolvedValue(mockTopCountries);

      const result = await getUserStats("user123");

      expect(result).toEqual({
        userId: "user123",
        email: "test@example.com",
        name: "Test User",
        totalLinksCreated: 5,
        uniqueLinksCount: 2,
        lastFiveLinks: mockLastFiveLinks,
        topCountries: [
          { country: "US", clickCount: 10 },
          { country: "UK", clickCount: 5 },
        ],
      });

      expect(db.user.findUnique).toHaveBeenCalledWith({
        where: { id: "user123" },
      });
      expect(db.link.count).toHaveBeenCalledWith({
        where: { userId: "user123" },
      });
      expect(db.link.findMany).toHaveBeenCalledTimes(2);
      expect(db.visit.findMany).toHaveBeenCalled();
    });

    it("should throw an error if user is not found", async () => {
      (db.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(getUserStats("nonexistent")).rejects.toThrow(
        ErrorWithStatus,
      );
      await expect(getUserStats("nonexistent")).rejects.toThrow(
        "User not found",
      );
    });

    it("should handle database errors", async () => {
      (db.user.findUnique as jest.Mock).mockRejectedValue(
        new Error("Database error"),
      );

      await expect(getUserStats("user123")).rejects.toThrow(ErrorWithStatus);
      await expect(getUserStats("user123")).rejects.toThrow(
        "An error occurred while fetching user stats",
      );
    });
  });

  describe("getUserByEmail", () => {
    it("should return user data if user is found", async () => {
      const mockUser: User = {
        id: "1",
        name: "Test User",
        email: "test@example.com",
        emailVerified: null,
        password: "hashedpassword",
        role: "USER",
        image: null,
        totalClicks: 0,
        uniqueCountryCount: 0,
      };
      (db.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      const result = await getUserByEmail("test@example.com");
      expect(result).toEqual(mockUser);
    });

    it("should return null if user is not found or an error occurs", async () => {
      (db.user.findUnique as jest.Mock).mockRejectedValue(
        new Error("DB error"),
      );
      const result = await getUserByEmail("nonexistent@example.com");
      expect(result).toBeNull();
    });
  });

  describe("sanitizeUser", () => {
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
});
