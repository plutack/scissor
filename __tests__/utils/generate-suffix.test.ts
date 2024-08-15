import generateUniqueLink from '@/utils/generate-suffix';
import isCustomSuffixInUse from '@/utils/check-custom-suffix';
import ErrorWithStatus from '@/exception/custom-error';

jest.mock('@/utils/check-custom-suffix');

describe('generateUniqueLink', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return the custom suffix if provided and not in use', async () => {
    (isCustomSuffixInUse as jest.Mock).mockResolvedValue(false);
    
    const result = await generateUniqueLink({ link: 'https://example.com', customSuffix: 'custom' });
    expect(result).toBe('custom');
    expect(isCustomSuffixInUse).toHaveBeenCalledWith('custom');
  });

  it('should throw an error if the custom suffix is already in use', async () => {
    (isCustomSuffixInUse as jest.Mock).mockResolvedValue(true);
    
    await expect(generateUniqueLink({ link: 'https://example.com', customSuffix: 'inuse' }))
      .rejects.toThrow(ErrorWithStatus);
    expect(isCustomSuffixInUse).toHaveBeenCalledWith('inuse');
  });

  it('should generate a unique suffix if no custom suffix is provided', async () => {
    (isCustomSuffixInUse as jest.Mock)
      .mockResolvedValueOnce(true)  // First generated suffix is in use
      .mockResolvedValueOnce(false); // Second generated suffix is not in use
    
    const result = await generateUniqueLink({ link: 'https://example.com' });
    expect(result).toMatch(/^[a-zA-Z]{5}$/);
    expect(isCustomSuffixInUse).toHaveBeenCalledTimes(2);
  });

  it('should handle errors from isCustomSuffixInUse', async () => {
    (isCustomSuffixInUse as jest.Mock).mockRejectedValue(new Error('Database error'));
    
    await expect(generateUniqueLink({ link: 'https://example.com' }))
      .rejects.toThrow('Database error');
  });

  it('should generate suffixes of length 5', async () => {
    (isCustomSuffixInUse as jest.Mock).mockResolvedValue(false);
    
    const result = await generateUniqueLink({ link: 'https://example.com' });
    expect(result).toHaveLength(5);
  });

  it('should only use allowed characters in generated suffixes', async () => {
    (isCustomSuffixInUse as jest.Mock).mockResolvedValue(false);
    
    const result = await generateUniqueLink({ link: 'https://example.com' });
    expect(result).toMatch(/^[a-zA-Z]+$/);
  });

  it('should log when generating a unique link', async () => {
    (isCustomSuffixInUse as jest.Mock).mockResolvedValue(false);
    const consoleSpy = jest.spyOn(console, 'log');
    
    await generateUniqueLink({ link: 'https://example.com' });
    
    consoleSpy.mockRestore();
  });
});