import { GET, PATCH } from "@/app/api/link/[linkId]/route";
import { getUserIdFromRequest } from "@/utils/auth";
import * as linkService from "@/services/link-service";
import { validateWithSchema } from "@/utils/validate-request";
import rateLimitIP from "@/utils/rate-limit";
import ErrorWithStatus from "@/exception/custom-error";

jest.mock("@/utils/auth", () => ({
  getUserIdFromRequest: jest.fn(),
}));
jest.mock("@/services/link-service");
jest.mock("@/utils/validate-request");
jest.mock("@/utils/rate-limit");

describe("GET function", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return link stats for authenticated user", async () => {
    const mockUserId = "user123";
    const mockLinkId = "link123";
    const mockLinkStats = { clicks: 10, countries: ["US", "UK"] };

    (rateLimitIP as jest.Mock).mockResolvedValue(undefined);
    (getUserIdFromRequest as jest.Mock).mockResolvedValue(mockUserId);
    (linkService.getLinkStats as jest.Mock).mockResolvedValue(mockLinkStats);

    const mockRequest = new Request("http://localhost/api/link/link123");
    const response = await GET(mockRequest, { params: { linkId: mockLinkId } });
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result).toEqual({ success: true, data: mockLinkStats });
    expect(rateLimitIP).toHaveBeenCalledWith(mockRequest);
    expect(getUserIdFromRequest).toHaveBeenCalledWith(mockRequest);
    expect(linkService.getLinkStats).toHaveBeenCalledWith(
      mockLinkId,
      mockUserId,
    );
  });

  it("should return 401 for unauthenticated user", async () => {
    (rateLimitIP as jest.Mock).mockResolvedValue(undefined);
    (getUserIdFromRequest as jest.Mock).mockResolvedValue(null);

    const mockRequest = new Request("http://localhost/api/link/link123");
    const response = await GET(mockRequest, { params: { linkId: "link123" } });
    const result = await response.json();

    expect(response.status).toBe(401);
    expect(result).toEqual({ success: false, message: "Unauthorized" });
  });

  it("should handle unexpected errors", async () => {
    (rateLimitIP as jest.Mock).mockResolvedValue(undefined);
    (getUserIdFromRequest as jest.Mock).mockRejectedValue(
      new Error("Unexpected error"),
    );

    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    const mockRequest = new Request("http://localhost/api/link/link123");
    const response = await GET(mockRequest, { params: { linkId: "link123" } });
    const result = await response.json();

    expect(response.status).toBe(500);
    expect(result).toEqual({
      success: false,
      message: "An unexpected error occurred",
    });
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});

describe("PATCH function", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should update link successfully", async () => {
    const mockUserId = "user123";
    const mockLinkId = "link123";
    const mockValidatedObject = { newCustomSuffix: "newSuffix" };

    (getUserIdFromRequest as jest.Mock).mockResolvedValue(mockUserId);
    (validateWithSchema as jest.Mock).mockResolvedValue(mockValidatedObject);
    (linkService.updateLink as jest.Mock).mockResolvedValue(undefined);

    const mockRequest = new Request("http://localhost/api/link/link123", {
      method: "PATCH",
      body: JSON.stringify(mockValidatedObject),
    });
    const response = await PATCH(mockRequest, {
      params: { linkId: mockLinkId },
    });
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result).toEqual({
      success: true,
      message: "Custom suffix changed succesfully",
    });
    expect(getUserIdFromRequest).toHaveBeenCalledWith(mockRequest);
    expect(validateWithSchema).toHaveBeenCalledWith(
      mockRequest,
      expect.anything(),
    );
    expect(linkService.updateLink).toHaveBeenCalledWith(
      mockLinkId,
      mockUserId,
      mockValidatedObject,
    );
  });

  it("should return 401 for unauthenticated user", async () => {
    (getUserIdFromRequest as jest.Mock).mockResolvedValue(null);
    (validateWithSchema as jest.Mock).mockResolvedValue({});

    const mockRequest = new Request("http://localhost/api/link/link123", {
      method: "PATCH",
      body: JSON.stringify({}),
    });
    const response = await PATCH(mockRequest, {
      params: { linkId: "link123" },
    });
    const result = await response.json();

    expect(response.status).toBe(401);
    expect(result).toEqual({ success: false, message: "Unauthorized" });
  });

  it("should handle ErrorWithStatus", async () => {
    (getUserIdFromRequest as jest.Mock).mockResolvedValue("user123");
    (validateWithSchema as jest.Mock).mockRejectedValue(
      new ErrorWithStatus("Invalid input", 400),
    );

    const consoleSpy = jest.spyOn(console, "log").mockImplementation();

    const mockRequest = new Request("http://localhost/api/link/link123", {
      method: "PATCH",
      body: JSON.stringify({}),
    });
    const response = await PATCH(mockRequest, {
      params: { linkId: "link123" },
    });
    const result = await response.json();

    expect(response.status).toBe(400);
    expect(result).toEqual({ success: false, message: "Invalid input" });
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("should handle unexpected errors", async () => {
    (getUserIdFromRequest as jest.Mock).mockRejectedValue(
      new Error("Unexpected error"),
    );
    (validateWithSchema as jest.Mock).mockResolvedValue({});

    const consoleSpy = jest.spyOn(console, "log").mockImplementation();

    const mockRequest = new Request("http://localhost/api/link/link123", {
      method: "PATCH",
      body: JSON.stringify({}),
    });
    const response = await PATCH(mockRequest, {
      params: { linkId: "link123" },
    });
    const result = await response.json();

    expect(response.status).toBe(500);
    expect(result).toEqual({
      success: false,
      message: "An unexpected error occurred",
    });
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
