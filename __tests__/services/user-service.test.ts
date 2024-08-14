import { getUserStats } from '@/services/user-service';
import { db } from '@/lib/db';
import ErrorWithStatus from '@/exception/custom-error';

jest.mock('@/lib/db', () => ({
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

describe('User Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserStats', () => {
    it('should return user stats', async () => {
      const mockUser = { id: 'user123', email: 'test@example.com', name: 'Test User' };
      const mockLinks = [{ link: 'http://example.com' }, { link: 'http://test.com' }];
      const mockLastFiveLinks = [
        { link: 'http://example.com', customSuffix: 'abc' },
        { link: 'http://test.com', customSuffix: 'def' },
      ];
      const mockTopCountries = [
        { country: 'US', count: 10 },
        { country: 'UK', count: 5 },
      ];

      (db.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (db.link.count as jest.Mock).mockResolvedValue(5);
      (db.link.findMany as jest.Mock)
        .mockResolvedValueOnce(mockLinks)
        .mockResolvedValueOnce(mockLastFiveLinks);
      (db.visit.findMany as jest.Mock).mockResolvedValue(mockTopCountries);

      const result = await getUserStats('user123');

      expect(result).toEqual({
        userId: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        totalLinksCreated: 5,
        uniqueLinksCount: 2,
        lastFiveLinks: mockLastFiveLinks,
        topCountries: [
          { country: 'US', clickCount: 10 },
          { country: 'UK', clickCount: 5 },
        ],
      });

      expect(db.user.findUnique).toHaveBeenCalledWith({ where: { id: 'user123' } });
      expect(db.link.count).toHaveBeenCalledWith({ where: { userId: 'user123' } });
      expect(db.link.findMany).toHaveBeenCalledTimes(2);
      expect(db.visit.findMany).toHaveBeenCalled();
    });

    it('should throw an error if user is not found', async () => {
      (db.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(getUserStats('nonexistent')).rejects.toThrow(ErrorWithStatus);
      await expect(getUserStats('nonexistent')).rejects.toThrow('User not found');
    });

    it('should handle database errors', async () => {
      (db.user.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(getUserStats('user123')).rejects.toThrow(ErrorWithStatus);
      await expect(getUserStats('user123')).rejects.toThrow('An error occurred while fetching user stats');
    });
  });
});