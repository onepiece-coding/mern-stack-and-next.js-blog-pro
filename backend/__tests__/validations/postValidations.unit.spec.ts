import { validateCreatePost, validateUpdatePost } from '../../src/validations/postValidations.js';
import mongoose from 'mongoose';

describe('postValidations', () => {
  test('validateCreatePost: accepts valid input and sanitizes title/description', () => {
    const validCategoryId = new mongoose.Types.ObjectId().toString();
    const rawTitle = '   <script>alert(1)</script> My Title   ';
    const rawDesc = '   <img src="x" onerror="alert(2)"> This is a long enough description.   ';

    const parsed = validateCreatePost.safeParse({
      title: rawTitle,
      description: rawDesc,
      categoryId: validCategoryId,
    });

    expect(parsed.success).toBe(true);
    if (!parsed.success) throw parsed.error;

    expect(parsed.data.categoryId).toBe(validCategoryId);

    expect(parsed.data.title).toEqual(expect.stringContaining('&lt;script&gt;'));
    expect(parsed.data.title).toEqual(expect.stringContaining('My Title'));
    expect(parsed.data.title[0]).not.toBe(' ');
    expect(parsed.data.title[parsed.data.title.length - 1]).not.toBe(' ');

    expect(parsed.data.description).toEqual(expect.stringContaining('This is a long enough description.'));
    expect(parsed.data.description.toLowerCase()).not.toContain('onerror');
    expect(parsed.data.description[0]).not.toBe(' ');
    expect(parsed.data.description[parsed.data.description.length - 1]).not.toBe(' ');
  });

  test('validateCreatePost: fails when title too short or description too short or invalid categoryId', () => {
    const shortTitle = 'A';
    const shortDesc = 'Too short';
    const invalidCategory = 'not-an-objectid';

    const parsed = validateCreatePost.safeParse({
      title: shortTitle,
      description: shortDesc,
      categoryId: invalidCategory,
    });

    expect(parsed.success).toBe(false);
    if (parsed.success) throw new Error('expected failure');

    const issues = parsed.error.issues.map((i) => ({ path: i.path.join('.'), msg: i.message }));
    expect(issues.some((it) => it.path === 'title')).toBe(true);
    expect(issues.some((it) => it.path === 'description')).toBe(true);
    expect(issues.some((it) => it.path === 'categoryId')).toBe(true);
  });

  test('validateUpdatePost: optional fields allowed when omitted', () => {
    const parsed = validateUpdatePost.safeParse({});
    expect(parsed.success).toBe(true);
    if (!parsed.success) throw parsed.error;

    expect(parsed.data).toEqual({});
  });

  test('validateUpdatePost: accepts valid optional fields and sanitizes them', () => {
    const rawTitle = '   <script>bad()</script> TitleTwo   ';
    const rawDesc = '   This description is long enough for update.   ';
    const validCategoryId = new mongoose.Types.ObjectId().toString();

    const parsed = validateUpdatePost.safeParse({
      title: rawTitle,
      description: rawDesc,
      categoryId: validCategoryId,
    });

    expect(parsed.success).toBe(true);
    if (!parsed.success) throw parsed.error;

    expect(parsed.data.title).toEqual(expect.stringContaining('&lt;script&gt;'));
    expect(parsed.data.title).toEqual(expect.stringContaining('TitleTwo'));
    expect(parsed.data.title![0]).not.toBe(' ');
    expect(parsed.data.title![parsed.data.title!.length - 1]).not.toBe(' ');

    expect(parsed.data.description).toEqual(expect.stringContaining('This description is long enough for update.'));
    expect(parsed.data.description![0]).not.toBe(' ');
    expect(parsed.data.description![parsed.data.description!.length - 1]).not.toBe(' ');

    expect(parsed.data.categoryId).toBe(validCategoryId);
  });

  test('validateUpdatePost: rejects invalid categoryId when provided', () => {
    const parsed = validateUpdatePost.safeParse({ categoryId: '123-not-valid' });
    expect(parsed.success).toBe(false);
    if (parsed.success) throw new Error('expected failure');

    const issues = parsed.error.issues.map((i) => ({ path: i.path.join('.'), msg: i.message }));
    expect(issues.some((it) => it.path === 'categoryId' && it.msg.includes('Invalid categoryId'))).toBe(true);
  });

  test('validateUpdatePost: rejects too-short title or description when provided (optional but validated)', () => {
    const p1 = validateUpdatePost.safeParse({ title: 'A' });
    expect(p1.success).toBe(false);
    if (p1.success) throw new Error('expected failure');
    
    const p2 = validateUpdatePost.safeParse({ description: 'short' });
    expect(p2.success).toBe(false);
    if (p2.success) throw new Error('expected failure');

    const paths1 = p1.error.issues.map((i) => i.path.join('.'));
    const paths2 = p2.error.issues.map((i) => i.path.join('.'));
    expect(paths1).toContain('title');
    expect(paths2).toContain('description');
  });
});