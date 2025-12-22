import mongoose from 'mongoose';
import VerificationToken from '../../src/models/VerificationToken.js';

describe('VerificationToken model schema', () => {
  test('model is registered with correct name', () => {
    expect(VerificationToken.modelName).toBe('VerificationToken');
  });

  test('schema has expected paths and options', () => {
    const schema = VerificationToken.schema as any;

    const userIdPath = schema.path('userId') as any;
    expect(userIdPath).toBeDefined();
    expect(userIdPath.instance).toBe('ObjectId');
    expect(userIdPath.options.ref).toBe('User');
    expect(userIdPath.options.required).toBeTruthy();

    const tokenPath = schema.path('token') as any;
    expect(tokenPath).toBeDefined();
    expect(tokenPath.instance).toBe('String');
    expect(tokenPath.options.required).toBeTruthy();

    expect(schema.options.timestamps).toBeTruthy();
  });

  test('validation fails when required fields are missing', async () => {
    const doc = new VerificationToken({});
    await expect(doc.validate()).rejects.toThrow(mongoose.Error.ValidationError);

    try {
      await doc.validate();
    } catch (err: unknown) {
      if (err instanceof mongoose.Error.ValidationError) {
        const keys = Object.keys(err.errors);
        expect(keys).toEqual(expect.arrayContaining(['userId', 'token']));
      } else {
        throw err;
      }
    }
  });

  test('valid document passes validation', async () => {
    const valid = new VerificationToken({
      userId: new mongoose.Types.ObjectId(),
      token: 'sometoken123',
    });

    await expect(valid.validate()).resolves.toBeUndefined();
    expect(valid.isNew).toBe(true);
    expect(valid.token).toBe('sometoken123');
    expect(mongoose.Types.ObjectId.isValid(valid.userId)).toBe(true);
  });

  test('extra unknown fields are not stored on the document (strict schema)', async () => {
    const doc = new VerificationToken({
      userId: new mongoose.Types.ObjectId(),
      token: 'x',
      unexpectedField: 'remove-me',
    } as any);

    const asObj = doc.toObject({ virtuals: false });
    expect((asObj as any).unexpectedField).toBeUndefined();
    expect((doc as any).unexpectedField).toBeUndefined();
  });
});