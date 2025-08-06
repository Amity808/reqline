const { createHandler } = require('@app-core/server');

module.exports = createHandler({
  path: '/health',
  method: 'get',
  async handler(rc, helpers) {
    return {
      status: helpers.http_statuses.HTTP_200_OK,
      data: {
        status: 'OK',
        message: 'Reqline parser is running',
        timestamp: Date.now(),
        service: 'reqline-parser',
        version: '1.0.0'
      },
    };
  },
}); 