const mockSendMail = jest.fn().mockResolvedValue({
  messageId: 'mocked-message-id',
  accepted: ['to@example.com'],
  rejected: [],
});

const mockTransporter = {
  sendMail: mockSendMail,
  verify: async () => true,
};

module.exports = {
  createTestAccount: async () => ({
    smtp: { host: 'smtp.test', port: 587, secure: false },
    user: 'testuser',
    pass: 'testpass',
  }),
  createTransport: () => mockTransporter,
  getTestMessageUrl: (info) => `https://ethereal.mock/${info.messageId}`,
  __mockTransporter: mockTransporter,
  __mockSendMail: mockSendMail,
};
module.exports.default = module.exports;