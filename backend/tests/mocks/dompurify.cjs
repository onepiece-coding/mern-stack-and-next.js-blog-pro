function createDOMPurify(_window) {
  return {
    sanitize: (str) => str // no-op sanitizer for tests; returns input unchanged
  };
}

// CommonJS export
module.exports = createDOMPurify;
// also provide default for ESM-style imports
module.exports.default = createDOMPurify;