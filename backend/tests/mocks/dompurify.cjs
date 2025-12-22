function createDOMPurify(_window) {
  return {
    sanitize: (str) => {
      if (typeof str !== 'string') return str;
      // Remove <script>...</script> blocks
      let out = str.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
      // Remove inline event handlers like onerror="..." or onclick='...'
      out = out.replace(/\son\w+=(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');
      return out;
    }
  };
}

// CommonJS export and default for ESM-style imports
module.exports = createDOMPurify;
module.exports.default = createDOMPurify;