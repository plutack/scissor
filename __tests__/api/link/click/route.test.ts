import { PATCH } from '@/app/api/link/click/route';
import * as linkService from '@/services/link-service';
import rateLimitIP from '@/utils/rate-limit';
import ErrorWithStatus from '@/exception/custom-error';

jest.mock('@/services/link-service');
jest.mock('@/utils/rate-limit');

describe('PATCH function', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update link click successfully', async () => {
    const mockBody = { customSuffix: 'abc123', country: 'US' };
    (rateLimitIP as jest.Mock).mockResolvedValue(undefined);
    (linkService.updateDbOnLinkClick as jest.Mock).mockResolvedValue(undefined);

    const mockRequest = new Request('http://localhost/api/link/click', {
      method: 'PATCH',
      body: JSON.stringify(mockBody),
    });

    const response = await PATCH(mockRequest);
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result).toEqual({ status: 204 });
    expect(rateLimitIP).toHaveBeenCalledWith(mockRequest);
    expect(linkService.updateDbOnLinkClick).toHaveBeenCalledWith('abc123', 'US');
  });

  it('should throw an error for invalid fields', async () => {
    const mockBody = { customSuffix: '', country: '' };
    (rateLimitIP as jest.Mock).mockResolvedValue(undefined);

    const mockRequest = new Request('http://localhost/api/link/click', {
      method: 'PATCH',
      body: JSON.stringify(mockBody),
    });

    const response = await PATCH(mockRequest);
    const result = await response.json();

    expect(response.status).toBe(400);
    expect(result).toEqual({ success: false, error: 'Invalid fields' });
  });

  it('should handle ErrorWithStatus', async () => {
    const mockBody = { customSuffix: 'abc123', country: 'US' };
    (rateLimitIP as jest.Mock).mockResolvedValue(undefined);
    (linkService.updateDbOnLinkClick as jest.Mock).mockRejectedValue(
      new ErrorWithStatus('Custom error', 422)
    );

    const mockRequest = new Request('http://localhost/api/link/click', {
      method: 'PATCH',
      body: JSON.stringify(mockBody),
    });


    const response = await PATCH(mockRequest);
    const result = await response.json();

    expect(response.status).toBe(422);
    expect(result).toEqual({ success: false, error: 'Custom error' });

  });

  it('should handle unexpected errors', async () => {
    const mockBody = { customSuffix: 'abc123', country: 'US' };
    (rateLimitIP as jest.Mock).mockResolvedValue(undefined);
    (linkService.updateDbOnLinkClick as jest.Mock).mockRejectedValue(new Error('Unexpected error'));

    const mockRequest = new Request('http://localhost/api/link/click', {
      method: 'PATCH',
      body: JSON.stringify(mockBody),
    });

    const response = await PATCH(mockRequest);
    const result = await response.json();

    expect(response.status).toBe(500);
    expect(result).toEqual({ message: 'Error updating link click' });
  });
});