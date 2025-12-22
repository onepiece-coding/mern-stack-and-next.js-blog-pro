import { z } from 'zod';
import { formatZodError } from '../../src/utils/zodHelper.js';

describe('formatZodError', () => {
  test('formats a root-level error (empty path) to (root)', () => {
    const schema = z.string().min(1, { message: 'cannot be empty' });
    const result = schema.safeParse('');
    expect(result.success).toBe(false);
    const formatted = formatZodError(result.error!);
    expect(Array.isArray(formatted)).toBe(true);
    expect(formatted).toHaveLength(1);
    expect(formatted[0]).toEqual({
      path: '(root)',
      message: 'cannot be empty',
    });
  });

  test('formats nested object errors joining path parts with dot', () => {
    const schema = z.object({
      user: z.object({
        name: z.string().min(2, { message: 'name too short' }),
      }),
      tags: z.array(z.string().min(3, { message: 'tag too short' })),
    });

    const payload = {
      user: { name: '' },
      tags: ['ab'],
    };

    const result = schema.safeParse(payload);
    expect(result.success).toBe(false);

    const formatted = formatZodError(result.error!);

    expect(formatted).toEqual(
      expect.arrayContaining([
        { path: 'user.name', message: 'name too short' },
        { path: 'tags.0', message: 'tag too short' },
      ]),
    );

    expect(formatted.length).toBeGreaterThanOrEqual(2);
  });

  test('handles numeric path elements (array indexes) correctly', () => {
    const schema = z.object({
      items: z.array(z.object({ value: z.number().min(10, { message: 'too small' }) })),
    });

    const payload = { items: [{ value: 5 }] };
    const result = schema.safeParse(payload);
    expect(result.success).toBe(false);

    const formatted = formatZodError(result.error!);
    expect(formatted).toContainEqual({
      path: 'items.0.value',
      message: 'too small',
    });
  });
});