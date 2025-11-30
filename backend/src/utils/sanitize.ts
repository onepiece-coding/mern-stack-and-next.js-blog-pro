import xss from 'xss';
import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// lightweight text sanitizer for titles/excerpts/etc.
export const sanitizeText = (value: unknown): unknown => {
  if (typeof value !== 'string') return value;
  return xss(value);
};

// DOMPurify for rich HTML content (if we ever allow it)
const window = new JSDOM('').window as unknown as Window;
const DOMPurify = createDOMPurify(window as any);

export const sanitizeHtml = (value: unknown): unknown => {
  if (typeof value !== 'string') return value;
  return DOMPurify.sanitize(value, {
    ALLOWED_TAGS: [
      'p',
      'br',
      'strong',
      'em',
      'ul',
      'ol',
      'li',
      'a',
      'img',
      'blockquote',
      'pre',
      'code',
      'h1',
      'h2',
      'h3',
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'rel'],
    RETURN_TRUSTED_TYPE: false,
  });
};
