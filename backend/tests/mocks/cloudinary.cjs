const stream = require('stream');

const v2 = {
  uploader: {
    upload_stream: (opts, cb) => {
      // Return a writable stream which triggers cb on 'finish'
      const pass = new stream.PassThrough();
      pass.on('finish', () => {
        cb(undefined, { public_id: 'mock-id', secure_url: 'https://example.com/mock.jpg' });
      });
      return pass;
    },
    destroy: async (publicId) => ({ result: 'ok', public_id: publicId }),
  },
  api: {
    delete_resources: async (ids) => {
      const out = {};
      ids.forEach((id) => (out[id] = 'deleted'));
      return { deleted: out };
    },
  },
  config: () => {},
};

// Export shape compatible with both named import { v2 } and default import
module.exports = { v2 };
module.exports.v2 = v2;
module.exports.default = module.exports;