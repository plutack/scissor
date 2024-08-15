import {
  getAllLinks,
  createLink,
  getLink,
  getLinkByCustomSuffix,
  updateLink,
  getUserTopCountries,
  updateDbOnLinkClick,
  getLinkStats,
} from "@/services/link-service";
import { db } from "@/lib/db";
import ErrorWithStatus from "@/exception/custom-error";
import isCustomSuffixInUse from "@/utils/check-custom-suffix";

jest.mock("@/lib/db", () => ({
  db: {
    link: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    visit: {
      groupBy: jest.fn(),
      findMany: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));
jest.mock("@/utils/check-custom-suffix");

describe("Link Service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllLinks", () => {
    it("should return paginated links", async () => {
      const mockLinks = [{ id: "1", name: "Test Link" }];
      (db.link.findMany as jest.Mock).mockResolvedValue(mockLinks);
      (db.link.count as jest.Mock).mockResolvedValue(1);

      const url = new URL("http://example.com?page=1&limit=10");
      const result = await getAllLinks(url, "user123");

      expect(result).toEqual({
        data: mockLinks,
        pagination: {
          page: 1,
          limit: 10,
          totalLinks: 1,
          totalPages: 1,
        },
      });
    });

    it("should handle errors", async () => {
      (db.link.findMany as jest.Mock).mockRejectedValue(new Error("DB error"));

      const url = new URL("http://example.com");
      await expect(getAllLinks(url, "user123")).rejects.toThrow(
        ErrorWithStatus,
      );
    });
  });

  describe("createLink", () => {
    it("should create a new link", async () => {
      const mockLink = { id: "1", name: "Test Link" };
      (db.link.create as jest.Mock).mockResolvedValue(mockLink);

      const result = await createLink(
        { name: "Test Link", link: "http://example.com" },
        "user123",
        "custom",
      );

      expect(result).toEqual({ success: true, data: mockLink });
    });

    it("should handle errors", async () => {
      (db.link.create as jest.Mock).mockRejectedValue(new Error("DB error"));

      await expect(
        createLink(
          { name: "Test Link", link: "http://example.com" },
          "user123",
          "custom",
        ),
      ).rejects.toThrow(ErrorWithStatus);
    });
  });

  describe("getLink", () => {
    it("should return a link", async () => {
      const mockLink = { id: "1", name: "Test Link" };
      (db.link.findUnique as jest.Mock).mockResolvedValue(mockLink);

      const result = await getLink("1", "user123");

      expect(result).toEqual(mockLink);
    });

    it("should throw error if link not found", async () => {
      (db.link.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(getLink("1", "user123")).rejects.toThrow(ErrorWithStatus);
    });
  });

  describe("getLinkByCustomSuffix", () => {
    it("should return a link by custom suffix", async () => {
      const mockLink = { id: "1", name: "Test Link" };
      (db.link.findUnique as jest.Mock).mockResolvedValue(mockLink);

      const result = await getLinkByCustomSuffix("custom");

      expect(result).toEqual(mockLink);
    });
  });

  describe("updateLink", () => {
    it("should update a link", async () => {
      (isCustomSuffixInUse as jest.Mock).mockResolvedValue(false);
      (db.link.update as jest.Mock).mockResolvedValue({
        id: "1",
        customSuffix: "newcustom",
      });

      await updateLink("1", "user123", { customSuffix: "newcustom" });

      expect(db.link.update).toHaveBeenCalled();
    });

    it("should throw error if custom suffix is in use", async () => {
      (isCustomSuffixInUse as jest.Mock).mockResolvedValue(true);

      await expect(
        updateLink("1", "user123", { customSuffix: "existing" }),
      ).rejects.toThrow(ErrorWithStatus);
    });
  });

  describe("getUserTopCountries", () => {
    it("should return top countries", async () => {
      const mockTopCountries = [{ country: "US", _sum: { count: 10 } }];
      (db.visit.groupBy as jest.Mock).mockResolvedValue(mockTopCountries);

      const result = await getUserTopCountries("user123");

      expect(result).toEqual([{ country: "US", clicks: 10 }]);
    });
  });

  describe("updateDbOnLinkClick", () => {
    it("should update link click data", async () => {
      const mockTransaction = jest.fn().mockImplementation((callback) =>
        callback({
          link: {
            update: jest.fn().mockResolvedValue({ id: "1", userId: "user123" }),
          },
          visit: {
            findFirst: jest.fn().mockResolvedValue(null),
            upsert: jest.fn().mockResolvedValue({ id: "1" }),
          },
          user: {
            update: jest.fn().mockResolvedValue({ id: "user123" }),
          },
        }),
      );
      (db.$transaction as jest.Mock).mockImplementation(mockTransaction);

      await updateDbOnLinkClick("custom", "US");

      expect(db.$transaction).toHaveBeenCalled();
    });
  });

  describe("getLinkStats", () => {
    it("should return link stats", async () => {
      const mockLink = { id: "1", name: "Test Link", clicks: 10 };
      const mockVisits = [
        { country: "US", count: 5 },
        { country: "UK", count: 5 },
      ];
      (db.link.findUnique as jest.Mock).mockResolvedValue(mockLink);
      (db.visit.findMany as jest.Mock).mockResolvedValue(mockVisits);

      const result = await getLinkStats("1", "user123");

      expect(result).toHaveProperty("link");
      expect(result).toHaveProperty("totalVisits", 10);
      expect(result).toHaveProperty("uniqueCountriesCount", 2);
      expect(result).toHaveProperty("top5Countries");
      expect(result).toHaveProperty("countryStats");
    });

    it("should throw error if link not found", async () => {
      (db.link.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(getLinkStats("1", "user123")).rejects.toThrow(
        ErrorWithStatus,
      );
    });
  });
});
