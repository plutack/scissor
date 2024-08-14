import { GET } from '@/app/api/user/stats/route';
import { getUserIdFromRequest } from '@/utils/auth';
import * as userService from '@/services/user-service';
import rateLimitIP from '@/utils/rate-limit';
import ErrorWithStatus from '@/exception/custom-error';

jest.mock("@/utils/auth", () => ({
    getUserIdFromRequest: jest.fn(),
  }));
jest.mock('@/services/user-service');
jest.mock('@/utils/rate-limit');

describe('GET function', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return user stats for authenticated user', async () => {
    const mockUserId = 'user123';
    const mockUserStats = {
      totalLinks: 10,
      totalClicks: 100,
      averageClicksPerLink: 10,
    };

    (rateLimitIP as jest.Mock).mockResolvedValue(undefined);
    (getUserIdFromRequest as jest.Mock).mockResolvedValue(mockUserId);
    (userService.getUserStats as jest.Mock).mockResolvedValue(mockUserStats);

    const mockRequest = new Request('http://localhost/api/user/stats');
    const response = await GET(mockRequest);
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result).toEqual({ success: true, data: mockUserStats });
    expect(rateLimitIP).toHaveBeenCalledWith(mockRequest);
    expect(getUserIdFromRequest).toHaveBeenCalledWith(mockRequest);
    expect(userService.getUserStats).toHaveBeenCalledWith(mockUserId);
  });

  it('should return 401 for unauthenticated user', async () => {
    (rateLimitIP as jest.Mock).mockResolvedValue(undefined);
    (getUserIdFromRequest as jest.Mock).mockResolvedValue(null);

    const mockRequest = new Request('http://localhost/api/user/stats');
    const response = await GET(mockRequest);
    const result = await response.json();

    expect(response.status).toBe(401);
    expect(result).toEqual({ success: false, error: 'Unauthorized' });
  });

  it('should handle rate limit errors', async () => {
    (rateLimitIP as jest.Mock).mockRejectedValue(new ErrorWithStatus('Rate limit exceeded', 429));

    const mockRequest = new Request('http://localhost/api/user/stats');
    const response = await GET(mockRequest);
    const result = await response.json();

    expect(response.status).toBe(429);
    expect(result).toEqual({ success: false, error: 'Rate limit exceeded' });
  });

  it('should handle unexpected errors', async () => {
    (rateLimitIP as jest.Mock).mockResolvedValue(undefined);
    (getUserIdFromRequest as jest.Mock).mockResolvedValue('user123');
    (userService.getUserStats as jest.Mock).mockRejectedValue(new Error('Unexpected error'));

    const mockRequest = new Request('http://localhost/api/user/stats');
    const response = await GET(mockRequest);
    const result = await response.json();

    expect(response.status).toBe(500);
    expect(result).toEqual({ success: false, error: 'internal server error' });
  });
});