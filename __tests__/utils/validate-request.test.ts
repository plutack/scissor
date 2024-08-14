import { validateWithSchema } from '@/utils/validate-request';
import { z } from 'zod';
import ErrorWithStatus from '@/exception/custom-error';

describe('validateWithSchema', () => {
  // Define a sample schema for testing
  const testSchema = z.object({
    name: z.string(),
    age: z.number().int().positive(),
  });

  it('should validate and return data when input is valid', async () => {
    const validInput = { name: 'John Doe', age: 30 };
    const mockRequest = {
      json: jest.fn().mockResolvedValue(validInput),
    } as unknown as Request;

    const result = await validateWithSchema(mockRequest, testSchema);

    expect(result).toEqual(validInput);
    expect(mockRequest.json).toHaveBeenCalled();
  });

  it('should throw ErrorWithStatus when input is invalid', async () => {
    const invalidInput = { name: 'John Doe', age: 'thirty' };
    const mockRequest = {
      json: jest.fn().mockResolvedValue(invalidInput),
    } as unknown as Request;

    await expect(validateWithSchema(mockRequest, testSchema)).rejects.toThrow(ErrorWithStatus);
    await expect(validateWithSchema(mockRequest, testSchema)).rejects.toThrow('Invalid fields');
    expect(mockRequest.json).toHaveBeenCalled();
  });

  it('should throw ErrorWithStatus when required fields are missing', async () => {
    const incompleteInput = { name: 'John Doe' };
    const mockRequest = {
      json: jest.fn().mockResolvedValue(incompleteInput),
    } as unknown as Request;

    await expect(validateWithSchema(mockRequest, testSchema)).rejects.toThrow(ErrorWithStatus);
    await expect(validateWithSchema(mockRequest, testSchema)).rejects.toThrow('Invalid fields');
    expect(mockRequest.json).toHaveBeenCalled();
  });

  it('should handle JSON parsing errors', async () => {
    const mockRequest = {
      json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
    } as unknown as Request;

    await expect(validateWithSchema(mockRequest, testSchema)).rejects.toThrow('Invalid JSON');
    expect(mockRequest.json).toHaveBeenCalled();
  });
});