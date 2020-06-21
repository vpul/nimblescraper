const { isURL } = require('validator');
const createError = require('http-errors');
const Sentry = require('@sentry/node');
const scraper = require('./scraper');

Sentry.init({
  dsn:
    'https://d68f2e461ec74fe7a076119faf47348c@o409422.ingest.sentry.io/5283934',
});

module.exports = async (req, res) => {
  try {
    if (
      process.env.NODE_ENV === 'production' &&
      req.headers['x-rapidapi-proxy-secret'] !== process.env.RapidAPISecret
    ) {
      throw createError(401, 'Unauthorized');
    }

    const { url } = req.query;
    if (url && isURL(url)) {
      const extractedData = await scraper(url);
      res.status(200).json({
        status: 'success',
        data: extractedData,
      });
    } else {
      throw createError(400, 'Invalid url');
    }
  } catch (error) {
    if (!error.status || !error.message) {
      // Only capture for internal server error
      Sentry.captureException(error);
      await Sentry.flush(2000);

      error.message =
        process.env.NODE_ENV === 'production'
          ? 'Internal server error'
          : error.message;
    }
    res.status(error.status || 500).json({
      status: 'error',
      code: error.status,
      message: error.message,
    });
  }
};
