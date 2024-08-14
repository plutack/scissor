import isCustomSuffixInUse from '@/utils/check-custom-suffix';
import { getLinkByCustomSuffix } from '@/services/link-service';
import { reservedSuffixes } from '@/constants/data';

// Mock the link service
jest.mock('@/services/link-service', () => ({
  getLinkByCustomSuffix: jest.fn(),
}));

describe('isCustomSuffixInUse', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return true for reserved suffixes', async () => {
    const reservedSuffix = reservedSuffixes[0]; // Get the first reserved suffix
    const result = await isCustomSuffixInUse(reservedSuffix);
    expect(result).toBe(true);
    expect(getLinkByCustomSuffix).not.toHaveBeenCalled();
  });

  it('should return true for existing custom suffixes', async () => {
    const existingSuffix = 'existing';
    (getLinkByCustomSuffix as jest.Mock).mockResolvedValue({ id: '1', customSuffix: existingSuffix });
    
    const result = await isCustomSuffixInUse(existingSuffix);
    expect(result).toBe(true);
    expect(getLinkByCustomSuffix).toHaveBeenCalledWith(existingSuffix);
  });

  it('should return false for non-existing and non-reserved suffixes', async () => {
    const newSuffix = 'newSuffix';
    (getLinkByCustomSuffix as jest.Mock).mockResolvedValue(null);
    
    const result = await isCustomSuffixInUse(newSuffix);
    expect(result).toBe(false);
    expect(getLinkByCustomSuffix).toHaveBeenCalledWith(newSuffix);
  });

  it('should handle errors from getLinkByCustomSuffix', async () => {
    const errorSuffix = 'errorSuffix';
    (getLinkByCustomSuffix as jest.Mock).mockRejectedValue(new Error('Database error'));
    
    await expect(isCustomSuffixInUse(errorSuffix)).rejects.toThrow('Database error');
    expect(getLinkByCustomSuffix).toHaveBeenCalledWith(errorSuffix);
  });
});