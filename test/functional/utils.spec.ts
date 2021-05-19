import { notNull, NotNullAssertionError } from '../../src';

describe('Utils', () => {
  describe('notNull method', () => {
    it('should return non-nullable value when value is defined', () => {
      const result = notNull('uwu');
      expect(result).toBeDefined();
      expect(result).toEqual('uwu');
    });

    it('should throw error when value is not defined', () => {
      expect(() => {
        notNull(null);
      }).toThrow(NotNullAssertionError);
    });
  });
});
