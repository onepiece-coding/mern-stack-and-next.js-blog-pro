import { validateCreateComment, validateUpdateComment } from '../../src/validations/commentValidations.js';
import mongoose from 'mongoose';

describe('commentValidations', () => {
  test('validateCreateComment accepts valid postId and sanitizes text', () => {
    const validId = new mongoose.Types.ObjectId().toString();
    const rawText = '   <script>alert(1)</script> Hello <b>world</b> <img src="x.jpg" onerror="alert(2)">   ';
    const parsed = validateCreateComment.safeParse({ postId: validId, text: rawText });

    expect(parsed.success).toBe(true);
    if (!parsed.success) throw parsed.error;

    expect(parsed.data.postId).toBe(validId);

    expect(parsed.data.text).toEqual(expect.stringContaining('&lt;script&gt;'));
    expect(parsed.data.text).toEqual(expect.stringContaining('Hello'));
    expect(parsed.data.text).toEqual(expect.stringContaining('<b>world</b>'));
    expect(parsed.data.text.toLowerCase()).not.toContain('onerror');
    expect(parsed.data.text[0]).not.toBe(' ');
    expect(parsed.data.text[parsed.data.text.length - 1]).not.toBe(' ');
  });

  test('validateCreateComment rejects invalid postId string (refine)', () => {
    const parsed = validateCreateComment.safeParse({ postId: 'not-a-valid-id', text: 'ok' });
    expect(parsed.success).toBe(false);
    if (parsed.success) throw new Error('expected failure');

    const issues = parsed.error.issues;
    expect(issues.some((i) => i.path[0] === 'postId' && i.message.includes('Invalid postId'))).toBe(true);
  });

  test('validateCreateComment rejects non-string postId', () => {
    const parsed = validateCreateComment.safeParse({ postId: 12345, text: 'ok' } as any);
    expect(parsed.success).toBe(false);
    if (parsed.success) throw new Error('expected failure');

    const paths = parsed.error.issues.map((i) => i.path.join('.'));
    expect(paths).toContain('postId');
  });

  test('validateUpdateComment accepts and sanitizes text (trim + preprocess)', () => {
    const raw = '   <script>alert(1)</script> hi <img src="a" onerror="x">   ';
    const parsed = validateUpdateComment.safeParse({ text: raw });
    expect(parsed.success).toBe(true);
    if (!parsed.success) throw parsed.error;

    expect(parsed.data.text).toEqual(expect.stringContaining('&lt;script&gt;'));
    expect(parsed.data.text.toLowerCase()).not.toContain('onerror');
    expect(parsed.data.text[0]).not.toBe(' ');
    expect(parsed.data.text[parsed.data.text.length - 1]).not.toBe(' ');
  });

  test('validateUpdateComment rejects non-string text', () => {
    const parsed = validateUpdateComment.safeParse({ text: 999 } as any);
    expect(parsed.success).toBe(false);
    if (parsed.success) throw new Error('expected failure');

    const paths = parsed.error.issues.map((i) => i.path.join('.'));
    expect(paths).toContain('text');
  });
});