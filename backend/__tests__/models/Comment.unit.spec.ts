import mongoose from 'mongoose';
import Comment from '../../src/models/Comment.js';

describe('Comment model schema', () => {
  test('model is registered with correct name', () => {
    expect(Comment.modelName).toBe('Comment');
  });

  test('schema has expected paths and options', () => {
    const schema = Comment.schema as any;

    const postIdPath = schema.path('postId') as any;
    expect(postIdPath).toBeDefined();
    expect(postIdPath.instance).toBe('ObjectId');
    expect(postIdPath.options.ref).toBe('Post');
    expect(postIdPath.options.required).toBeTruthy();

    const userPath = schema.path('user') as any;
    expect(userPath).toBeDefined();
    expect(userPath.instance).toBe('ObjectId');
    expect(userPath.options.ref).toBe('User');
    expect(userPath.options.required).toBeTruthy();

    const textPath = schema.path('text') as any;
    expect(textPath).toBeDefined();
    expect(textPath.instance).toBe('String');
    expect(textPath.options.required).toBeTruthy();

    const usernamePath = schema.path('username') as any;
    expect(usernamePath).toBeDefined();
    expect(usernamePath.instance).toBe('String');
    expect(usernamePath.options.required).toBeTruthy();

    expect(schema.options.timestamps).toBeTruthy();
  });

  test('validation fails when required fields are missing', async () => {
    const doc = new Comment({});
    await expect(doc.validate()).rejects.toThrow(mongoose.Error.ValidationError);

    try {
      await doc.validate();
    } catch (err: unknown) {
      if (err instanceof mongoose.Error.ValidationError) {
        const keys = Object.keys(err.errors);
        expect(keys).toEqual(
          expect.arrayContaining(['postId', 'user', 'text', 'username']),
        );
      } else {
        throw err;
      }
    }
  });

  test('valid document passes validation', async () => {
    const valid = new Comment({
      postId: new mongoose.Types.ObjectId(),
      user: new mongoose.Types.ObjectId(),
      text: 'This is a test comment',
      username: 'tester',
    });

    await expect(valid.validate()).resolves.toBeUndefined();
    expect(valid.isNew).toBe(true);
    expect(valid.text).toBe('This is a test comment');
    expect(valid.username).toBe('tester');
  });

  test('extra unknown fields are not stored on the document (strict schema)', async () => {
    const doc = new Comment({
      postId: new mongoose.Types.ObjectId(),
      user: new mongoose.Types.ObjectId(),
      text: 'ok',
      username: 'u',
      unexpectedField: 'shouldBeRemoved',
    } as any);

    const asObj = doc.toObject({ virtuals: false });
    expect((asObj as any).unexpectedField).toBeUndefined();
    expect((doc as any).unexpectedField).toBeUndefined();
  });
});