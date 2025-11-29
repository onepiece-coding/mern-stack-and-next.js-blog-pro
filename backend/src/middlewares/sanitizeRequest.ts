import type { RequestHandler } from 'express';
import xss from 'xss';

/**
 * Recursively sanitize an input value. Only transforms strings.
 * Leaves numbers, booleans, null, undefined, Date, Buffer, and objects/arrays of those intact.
 */
function sanitizeValue(value: unknown): unknown {
  if (typeof value === 'string') {
    // sanitize string HTML content
    return xss(value);
  }

  if (Array.isArray(value)) {
    return value.map((v) => sanitizeValue(v));
  }

  if (value && typeof value === 'object' && !(value instanceof Date) && !(value instanceof Buffer)) {
    // maintain object shape but sanitize string properties
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = sanitizeValue(v);
    }
    return out;
  }

  // numbers, booleans, null, undefined, Date, Buffer -> return as-is
  return value;
}

/**
 * Middleware that sanitizes req.body, req.query and req.params.
 * NOTE: it mutates req.{body,query,params} and replaces string fields with sanitized versions.
 */
const sanitizeRequest: RequestHandler = (req, _res, next) => {
  try {
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeValue(req.body) as typeof req.body;
    }
    if (req.query && typeof req.query === 'object') {
      req.query = sanitizeValue(req.query) as typeof req.query;
    }
    if (req.params && typeof req.params === 'object') {
      req.params = sanitizeValue(req.params) as typeof req.params;
    }
    return next();
  } catch (err) {
    // If something goes wrong, don't leak internals — let error handler manage it
    return next(err);
  }
};

export default sanitizeRequest;