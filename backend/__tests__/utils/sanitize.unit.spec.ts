import { sanitizeText, sanitizeHtml } from '../../src/utils/sanitize.js';

describe('utils/sanitize', () => {
  describe('sanitizeText', () => {
    test('returns non-string values unchanged', () => {
      const num = 123;
      const obj = { foo: 'bar' };
      expect(sanitizeText(num)).toBe(num);
      expect(sanitizeText(obj)).toBe(obj);
    });

    test('removes script tags and inline event handlers, preserves safe content', () => {
      const input = '<script>alert(1)</script>Hello<img src=x onerror=alert(2) />';
      const out = sanitizeText(input) as string;

      expect(out).not.toContain('<script');
      expect(out.toLowerCase()).not.toContain('onerror');
      expect(out).toContain('Hello');
    });

    test('preserves simple formatting tags like <b> (xss default whitelist)', () => {
      const out = sanitizeText('<b>bold</b>') as string;
      expect(out).toContain('<b>bold</b>');
    });
  });

  describe('sanitizeHtml', () => {
    test('returns non-string values unchanged', () => {
      const arr: any = [1, 2, 3];
      expect(sanitizeHtml(arr)).toBe(arr);
      const n = 0;
      expect(sanitizeHtml(n)).toBe(n);
    });

    test('removes <script> and event handlers but keeps allowed tags & attributes', () => {
      const input = `<p onclick="bad()">Paragraph<script>evil()</script>
        <a href="http://example.com" onclick="bad">link</a>
        <img src="pic.jpg" onerror="bad" alt="imgalt">
        <h1>Heading</h1>
        <code>const x = 1</code>
      </p>`;

      const out = sanitizeHtml(input) as string;

      expect(out).not.toContain('<script');
      expect(out.toLowerCase()).not.toContain('onclick=');
      expect(out.toLowerCase()).not.toContain('onerror=');

      expect(out).toEqual(expect.stringContaining('<a'));
      expect(out).toEqual(expect.stringContaining('href="http://example.com"'));
      expect(out).toEqual(expect.stringContaining('<img'));
      expect(out).toEqual(expect.stringContaining('alt="imgalt"'));
      expect(out).toEqual(expect.stringContaining('<h1>Heading</h1>'));
      expect(out).toEqual(expect.stringContaining('<code>const x = 1</code>'));
    });

    test('sanitizes img and anchor attributes (removes event handlers but preserves src/href)', () => {
      const input = `<img src="x.jpg" onerror="alert(1)"><a href="x.html" onclick="alert(2)">x</a>`;
      const out = sanitizeHtml(input) as string;

      expect(out.toLowerCase()).not.toContain('onerror=');
      expect(out.toLowerCase()).not.toContain('onclick=');
      expect(out).toContain('src="x.jpg"');
      expect(out).toContain('href="x.html"');
    });
  });
});