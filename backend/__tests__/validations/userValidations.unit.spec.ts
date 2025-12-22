import {
  passwordSchema,
  validateRegisterUser,
  validateLoginUser,
  validateEmail,
  validateNewPassword,
  validateUpdateUser,
} from '../../src/validations/userValidations.js';

describe('userValidations', () => {
  test('passwordSchema: accepts a valid strong password', () => {
    const good = 'Str0ng!Pass';
    const parsed = passwordSchema.safeParse(good);
    expect(parsed.success).toBe(true);
  });

  test('passwordSchema: rejects too short password', () => {
    const parsed = passwordSchema.safeParse('Aa1!');
    expect(parsed.success).toBe(false);
    expect(parsed.error!.issues.some((i) => i.message.includes('at least 8'))).toBe(true);
  });

  test('passwordSchema: rejects missing uppercase', () => {
    const parsed = passwordSchema.safeParse('lowercase1!');
    expect(parsed.success).toBe(false);
    expect(parsed.error!.issues.some((i) => i.message.includes('uppercase'))).toBe(true);
  });

  test('passwordSchema: rejects missing number', () => {
    const parsed = passwordSchema.safeParse('NoNumber!');
    expect(parsed.success).toBe(false);
    expect(parsed.error!.issues.some((i) => i.message.includes('number'))).toBe(true);
  });

  test('passwordSchema: rejects missing special character', () => {
    const parsed = passwordSchema.safeParse('Password1');
    expect(parsed.success).toBe(false);
    expect(parsed.error!.issues.some((i) => i.message.includes('special character'))).toBe(true);
  });

  test('passwordSchema: rejects too long password (>128)', () => {
    const longBase = 'A1!';
    const long = longBase.repeat(50);
    const parsed = passwordSchema.safeParse(long);
    expect(parsed.success).toBe(false);
    expect(parsed.error!.issues.some((i) => i.message.includes('at most 128'))).toBe(true);
  });

  test('validateRegisterUser: accepts and sanitizes username/email and valid password', () => {
    const input = {
      username: '   <script>bad()</script>Alice   ',
      email: 'alice@example.com',
      password: 'GoodPass1!',
    };

    const parsed = validateRegisterUser.safeParse(input);
    expect(parsed.success).toBe(true);
    if (!parsed.success) throw parsed.error;

    expect(parsed.data.username).toEqual(expect.stringContaining('&lt;script&gt;'));
    expect(parsed.data.username).toEqual(expect.stringContaining('Alice'));
    expect(parsed.data.email).toBe('alice@example.com');
  });

  test('validateRegisterUser: rejects invalid email and invalid password (multiple errors)', () => {
    const input = {
      username: 'Bob',
      email: 'not-an-email',
      password: 'weak',
    };
    const parsed = validateRegisterUser.safeParse(input);
    expect(parsed.success).toBe(false);
    const msgs = parsed.error!.issues.map((i) => i.message);
    expect(msgs.some((m) => /Invalid email/i.test(m) || /Email/i.test(m))).toBe(true);
    expect(parsed.error!.issues.some((i) => i.path[0] === 'password')).toBe(true);
  });

  test('validateLoginUser: accepts valid login input', () => {
    const parsed = validateLoginUser.safeParse({ email: 'me@test.com', password: 'x' });
    expect(parsed.success).toBe(true);
  });

  test('validateLoginUser: rejects invalid email or missing password', () => {
    const p1 = validateLoginUser.safeParse({ email: 'not-an-email', password: 'x' });
    expect(p1.success).toBe(false);
    expect(p1.error!.issues.some((i) => i.path[0] === 'email')).toBe(true);

    const p2 = validateLoginUser.safeParse({ email: 'a@b.com', password: '' });
    expect(p2.success).toBe(false);
    expect(p2.error!.issues.some((i) => i.path[0] === 'password')).toBe(true);
  });

  test('validateEmail: accepts valid and rejects invalid', () => {
    expect(validateEmail.safeParse({ email: 'ok@x.com' }).success).toBe(true);
    expect(validateEmail.safeParse({ email: 'bad-email' }).success).toBe(false);
  });

  test('validateNewPassword: accepts good and rejects bad', () => {
    expect(validateNewPassword.safeParse({ password: 'ValidPass1!' }).success).toBe(true);
    expect(validateNewPassword.safeParse({ password: 'short' }).success).toBe(false);
  });

  test('validateUpdateUser: accepts empty payload (all optional)', () => {
    const parsed = validateUpdateUser.safeParse({});
    expect(parsed.success).toBe(true);
  });

  test('validateUpdateUser: accepts and sanitizes username & bio when provided', () => {
    const input = {
      username: '   <script>x</script>NewName   ',
      bio: '   hi <img src="x" onerror="alert(1)">   ',
    };
    const parsed = validateUpdateUser.safeParse(input);
    expect(parsed.success).toBe(true);
    if (!parsed.success) throw parsed.error;

    expect(parsed.data.username).toEqual(expect.stringContaining('&lt;script&gt;'));
    expect(parsed.data.username).toEqual(expect.stringContaining('NewName'));
    expect(parsed.data.bio!.toLowerCase()).not.toContain('onerror');
  });

  test('validateUpdateUser: rejects invalid password when provided', () => {
    const parsed = validateUpdateUser.safeParse({ password: 'weak' });
    expect(parsed.success).toBe(false);
    expect(parsed.error!.issues.some((i) => i.path[0] === 'password')).toBe(true);
  });

  test('validateUpdateUser: rejects too-short username when provided', () => {
    const parsed = validateUpdateUser.safeParse({ username: 'a' });
    expect(parsed.success).toBe(false);
    expect(parsed.error!.issues.some((i) => i.path[0] === 'username')).toBe(true);
  });
});