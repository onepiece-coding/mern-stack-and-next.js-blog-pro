import mongoose from 'mongoose';
import Post from '../../src/models/Post.js';

describe('Post model schema', () => {
  test('model is registered with correct name', () => {
    expect(Post.modelName).toBe('Post');
  });

  test('schema has expected paths and options', () => {
    const schema = Post.schema as any;

    const titlePath = schema.path('title') as any;
    expect(titlePath).toBeDefined();
    expect(titlePath.instance).toBe('String');
    expect(titlePath.options.required).toBeTruthy();
    expect(titlePath.options.minlength).toBe(2);
    expect(titlePath.options.maxlength).toBe(200);

    const descPath = schema.path('description') as any;
    expect(descPath).toBeDefined();
    expect(descPath.instance).toBe('String');
    expect(descPath.options.required).toBeTruthy();
    expect(descPath.options.minlength).toBe(10);

    const userPath = schema.path('user') as any;
    expect(userPath).toBeDefined();
    expect(userPath.instance).toBe('ObjectId');
    expect(userPath.options.ref).toBe('User');
    expect(userPath.options.required).toBeTruthy();

    const catPath = schema.path('categoryId') as any;
    expect(catPath).toBeDefined();
    expect(catPath.instance).toBe('ObjectId');
    expect(catPath.options.ref).toBe('Category');
    expect(catPath.options.required).toBeTruthy();

    const imagePath = schema.path('image') as any;
    expect(imagePath).toBeDefined();

    const likesPath = schema.path('likes') as any;
    expect(likesPath).toBeDefined();
    expect(likesPath.instance).toBe('Array');
    expect(likesPath.caster?.instance).toBe('ObjectId');

    expect(schema.options.timestamps).toBeTruthy();
    expect(schema.options.toJSON?.virtuals).toBeTruthy();
    expect(schema.options.toObject?.virtuals).toBeTruthy();
  });

  test('text index exists for title and description', () => {
    const schema = Post.schema as any;
    const indexes = schema.indexes();
    const foundTextIndex = indexes.some(
      (entry: any) =>
        entry &&
        entry[0] &&
        entry[0].title === 'text' &&
        entry[0].description === 'text',
    );
    expect(foundTextIndex).toBe(true);
  });

  test('virtual "comments" is defined and references postId', () => {
    const schema = Post.schema as any;
    const virtuals = schema.virtuals as Record<string, any>;
    expect(Object.keys(virtuals)).toContain('comments');
    expect(virtuals.comments.options.foreignField).toBe('postId');
    expect(virtuals.comments.options.localField).toBe('_id');
    expect(virtuals.comments.options.ref).toBe('Comment');
  });

  test('validation fails when required fields are missing', async () => {
    const doc = new Post({});
    await expect(doc.validate()).rejects.toThrow(mongoose.Error.ValidationError);

    try {
      await doc.validate();
    } catch (err: unknown) {
      if (err instanceof mongoose.Error.ValidationError) {
        const keys = Object.keys(err.errors);
        expect(keys).toEqual(
          expect.arrayContaining(['title', 'description', 'user', 'categoryId']),
        );
      } else {
        throw err;
      }
    }
  });

  test('validation enforces title minlength and description minlength', async () => {
    const shortTitle = new Post({
      title: 'a',
      description: '0123456789',
      user: new mongoose.Types.ObjectId(),
      categoryId: new mongoose.Types.ObjectId(),
    } as any);

    await expect(shortTitle.validate()).rejects.toThrow(mongoose.Error.ValidationError);
    try {
      await shortTitle.validate();
    } catch (err: unknown) {
      if (err instanceof mongoose.Error.ValidationError) {
        expect(Object.keys(err.errors)).toContain('title');
      } else {
        throw err;
      }
    }

    const shortDesc = new Post({
      title: 'Valid title',
      description: 'short',
      user: new mongoose.Types.ObjectId(),
      categoryId: new mongoose.Types.ObjectId(),
    } as any);

    await expect(shortDesc.validate()).rejects.toThrow(mongoose.Error.ValidationError);
    try {
      await shortDesc.validate();
    } catch (err: unknown) {
      if (err instanceof mongoose.Error.ValidationError) {
        expect(Object.keys(err.errors)).toContain('description');
      } else {
        throw err;
      }
    }
  });

  test('valid document passes validation and defaults are present', async () => {
    const valid = new Post({
      title: 'A valid post title',
      description: 'This description has more than ten chars',
      user: new mongoose.Types.ObjectId(),
      categoryId: new mongoose.Types.ObjectId(),
    });

    await expect(valid.validate()).resolves.toBeUndefined();


    expect(valid.image).toBeDefined();
    expect((valid.image as any).url).toBeDefined();
    expect((valid.image as any).publicId === null || (valid.image as any).publicId === undefined).toBeTruthy();

    expect(Array.isArray(valid.likes)).toBe(true);
  });

  test('extra unknown fields are not stored on the document (strict schema)', async () => {
    const doc = new Post({
      title: 't',
      description: '0123456789',
      user: new mongoose.Types.ObjectId(),
      categoryId: new mongoose.Types.ObjectId(),
      unexpected: 'nope',
    } as any);

    const asObj = doc.toObject({ virtuals: false });
    expect((asObj as any).unexpected).toBeUndefined();
    expect((doc as any).unexpected).toBeUndefined();
  });
});