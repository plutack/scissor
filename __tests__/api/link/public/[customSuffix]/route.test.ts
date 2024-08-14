import { GET } from '@/app/api/link/public/[customSuffix]/route';
import * as linkService from '@/services/link-service';
import rateLimitIP from '@/utils/rate-limit';
import ErrorWithStatus from '@/exception/custom-error';

jest.mock('@/services/link-service');
jest.mock('@/utils/rate-limit');

describe('GET function', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return link data for valid custom suffix', async () => {
    const mockCustomSuffix = 'abc123';
    const mockLink = { link: 'https://example.com' };

    (rateLimitIP as jest.Mock).mockResolvedValue(undefined);
    (linkService.getLinkByCustomSuffix as jest.Mock).mockResolvedValue({ link: mockLink.link });

    const mockRequest = new Request(`http://localhost/api/link/public/${mockCustomSuffix}`);
    const response = await GET(mockRequest, { params: { customSuffix: mockCustomSuffix } });
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result).toEqual({ success: true, data: mockLink.link });
    expect(rateLimitIP).toHaveBeenCalledWith(mockRequest);
    expect(linkService.getLinkByCustomSuffix).toHaveBeenCalledWith(mockCustomSuffix);
  });

  it('should return 404 for non-existent custom suffix', async () => {
    const mockCustomSuffix = 'nonexistent';

    (rateLimitIP as jest.Mock).mockResolvedValue(undefined);
    (linkService.getLinkByCustomSuffix as jest.Mock).mockResolvedValue(null);

    const mockRequest = new Request(`http://localhost/api/link/public/${mockCustomSuffix}`);
    const response = await GET(mockRequest, { params: { customSuffix: mockCustomSuffix } });
    const result = await response.json();

    expect(response.status).toBe(404);
    expect(result).toEqual({ success: false, message: 'Link not found' });
  });

  it('should handle rate limit errors', async () => {
    const mockCustomSuffix = 'abc123';

    (rateLimitIP as jest.Mock).mockRejectedValue(new ErrorWithStatus('Rate limit exceeded', 429));

    const mockRequest = new Request(`http://localhost/api/link/public/${mockCustomSuffix}`);
    const response = await GET(mockRequest, { params: { customSuffix: mockCustomSuffix } });
    const result = await response.json();

    expect(response.status).toBe(429);
    expect(result).toEqual({ success: false, message: 'Rate limit exceeded' });
  });

  it('should handle unexpected errors', async () => {
    const mockCustomSuffix = 'abc123';

    (rateLimitIP as jest.Mock).mockResolvedValue(undefined);
    (linkService.getLinkByCustomSuffix as jest.Mock).mockRejectedValue(new Error('Unexpected error'));

    const mockRequest = new Request(`http://localhost/api/link/public/${mockCustomSuffix}`);
    const response = await GET(mockRequest, { params: { customSuffix: mockCustomSuffix } });
    const result = await response.json();

    expect(response.status).toBe(500);
    expect(result).toEqual({ success: false, message: 'Error fetching link' });
  });
});