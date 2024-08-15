import { GET, POST } from "@/app/api/link/route";
import * as authUtils from "@/utils/auth";
import * as linkService from "@/services/link-service";
import * as validateRequest from "@/utils/validate-request";
import * as generateSuffix from "@/utils/generate-suffix";
import * as rateLimit from "@/utils/rate-limit";
import ErrorWithStatus from "@/exception/custom-error";

jest.mock("@/utils/auth", () => ({
  getUserIdFromRequest: jest.fn(),
}));
jest.mock("@/services/link-service");
jest.mock("@/utils/validate-request");
jest.mock("@/utils/generate-suffix");
jest.mock("@/utils/rate-limit");

describe("GET function", () => {
  it("should return links and pagination for authenticated user", async () => {
    const mockUserId = "user123";
    const mockLinks = [{ id: 1, url: "https://example.com" }];
    const mockPagination = {
      page: 1,
      limit: 10,
      totalLinks: 1,
      totalPages: 1,
    };

    (authUtils.getUserIdFromRequest as jest.Mock).mockResolvedValue(mockUserId);
    (linkService.getAllLinks as jest.Mock).mockResolvedValue({
      success: true,
      data: mockLinks,
      pagination: mockPagination
    });
    (rateLimit.default as jest.Mock).mockResolvedValue(undefined);

    const mockRequest = new Request("http://localhost/api/link");
    const response = await GET(mockRequest);
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result).toEqual({
      success: true,
      data: mockLinks,
      pagination: mockPagination
    });
  });

  it("should return 401 for unauthenticated user", async () => {
    (authUtils.getUserIdFromRequest as jest.Mock).mockResolvedValue(null);
    (rateLimit.default as jest.Mock).mockResolvedValue(undefined);

    const mockRequest = new Request("http://localhost/api/link");
    const response = await GET(mockRequest);
    const result = await response.json();

    expect(response.status).toBe(401);
    expect(result).toEqual({ success: false, error: "Unauthorized" });
  });
});

describe("POST function", () => {
  it("should create a new link", async () => {
    const mockUserId = "user123";
    const mockValidatedObject = { originalUrl: "https://example.com" };
    const mockCustomSuffix = "abc123";
    const mockCreatedLink = {
      id: 1,
      originalUrl: "https://example.com",
      shortUrl: "abc123",
    };

    (authUtils.getUserIdFromRequest as jest.Mock).mockResolvedValue(mockUserId);
    (validateRequest.validateWithSchema as jest.Mock).mockResolvedValue(
      mockValidatedObject,
    );
    (generateSuffix.default as jest.Mock).mockResolvedValue(mockCustomSuffix);
    (linkService.createLink as jest.Mock).mockResolvedValue(mockCreatedLink);
    (rateLimit.default as jest.Mock).mockResolvedValue(undefined);

    const mockRequest = new Request("http://localhost/api/link", {
      method: "POST",
      body: JSON.stringify(mockValidatedObject),
    });

    const response = await POST(mockRequest);
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result).toEqual({ success: true, data: mockCreatedLink });
  });

  it("should handle errors and return appropriate response", async () => {
    const mockError = new ErrorWithStatus("Invalid fields", 400);

    (authUtils.getUserIdFromRequest as jest.Mock).mockRejectedValue(mockError);
    (rateLimit.default as jest.Mock).mockResolvedValue(undefined);

    const mockRequest = new Request("http://localhost/api/link", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const response = await POST(mockRequest);
    const result = await response.json();

    expect(response.status).toBe(400);
    expect(result).toEqual({ success: false, error: "Invalid fields" });
  });
});
