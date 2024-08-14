import { GET } from '@/app/api/link/top-countries/route';
import { getUserIdFromRequest } from '@/utils/auth';
import * as linkService from '@/services/link-service';
import rateLimitIP from '@/utils/rate-limit';
import ErrorWithStatus from '@/exception/custom-error';

jest.mock("@/utils/auth", () => ({
  getUserIdFromRequest: jest.fn(),
}));
jest.mock('@/services/link-service');
jest.mock('@/utils/rate-limit');

describe('GET function', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return top countries for authenticated user', async () => {
    const mockUserId = 'user123';
    const mockTopCountries = [
      { country: 'US', count: 100 },
      { country: 'UK', count: 50 },
    ];

    (rateLimitIP as jest.Mock).mockResolvedValue(undefined);
    (getUserIdFromRequest as jest.Mock).mockResolvedValue(mockUserId);
    (linkService.getUserTopCountries as jest.Mock).mockResolvedValue(mockTopCountries);

    const mockRequest = new Request('http://localhost/api/link/top-countries');
    const response = await GET(mockRequest);
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result).toEqual({ success: true, data: mockTopCountries });
    expect(rateLimitIP).toHaveBeenCalledWith(mockRequest);
    expect(getUserIdFromRequest).toHaveBeenCalledWith(mockRequest);
    expect(linkService.getUserTopCountries).toHaveBeenCalledWith(mockUserId);
  });

  it('should return 401 for unauthenticated user', async () => {
    (rateLimitIP as jest.Mock).mockResolvedValue(undefined);
    (getUserIdFromRequest as jest.Mock).mockResolvedValue(null);

    const mockRequest = new Request('http://localhost/api/link/top-countries');
    const response = await GET(mockRequest);
    const result = await response.json();

    expect(response.status).toBe(401);
    expect(result).toEqual({ success: false, error: 'Unauthorized' });
  });

  it('should handle rate limit errors', async () => {
    (rateLimitIP as jest.Mock).mockRejectedValue(new ErrorWithStatus('Rate limit exceeded', 429));

    const mockRequest = new Request('http://localhost/api/link/top-countries');
    const response = await GET(mockRequest);
    const result = await response.json();

    expect(response.status).toBe(429);
    expect(result).toEqual({ success: false, error: 'Rate limit exceeded' });
  });

  it('should handle unexpected errors', async () => {
    (rateLimitIP as jest.Mock).mockResolvedValue(undefined);
    (getUserIdFromRequest as jest.Mock).mockRejectedValue(new Error('Unexpected error'));

    const mockRequest = new Request('http://localhost/api/link/top-countries');
    const response = await GET(mockRequest);
    const result = await response.json();

    expect(response.status).toBe(500);
    expect(result).toEqual({ success: false, error: 'An unexpected error occurred' });
  });
});