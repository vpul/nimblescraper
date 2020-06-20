const createError = require('http-errors');
const axios = require('axios');
const Sentry = require('@sentry/node');
const metascraper = require('metascraper')([
  require('metascraper-soundcloud')(),
  require('metascraper-author')(),
  require('metascraper-date')(),
  require('metascraper-description')(),
  require('metascraper-image')(),
  require('metascraper-logo')(),
  require('metascraper-clearbit')(),
  require('metascraper-publisher')(),
  require('metascraper-title')(),
  require('metascraper-url')(),
  require('./metascraper-readability-modified')(),
  require('metascraper-publisher')(),
  require('metascraper-amazon')(),
  require('metascraper-audio')(),
  require('metascraper-lang')(),
  require('metascraper-logo-favicon')(),
  // require('metascraper-media-provider')(),
  require('metascraper-uol')(),
  require('metascraper-spotify')(),
  require('metascraper-video')(),
  require('metascraper-youtube')(),
  require('metascraper-iframe')(),
]);

Sentry.init({
  dsn:
    'https://d68f2e461ec74fe7a076119faf47348c@o409422.ingest.sentry.io/5283934',
});

const scraper = async (targetUrl) => {
  try {
    if (targetUrl.substring(0, 4) !== 'http') {
      targetUrl = 'http://' + targetUrl;
    }

    const response = await axios(targetUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:15.0) Gecko/20100101 Firefox/77.0.1',
      },
      maxContentLength: 10000000, // 10 mb
    });
    const url = response.request.res.responseUrl;
    const html = response.data;
    const metadata = await metascraper({ html, url });
    return metadata;
  } catch (error) {
    Sentry.captureException(error);
    await Sentry.flush(2000);

    if (error.response) {
      // Request made and server responded
      const { status, statusText } = error.response;
      throw createError(status, statusText);
    } else if (error.request) {
      // The request was made but no response was received
      if (error.message === 'maxContentLength size of 10000 exceeded') {
        throw createError(413, 'Maximum file size exceeded');
      } else if (error.code === 'ENOTFOUND') {
        throw createError(404, 'Not found');
      } else if (error.code === 'ECONNREFUSED') {
        throw createError(400, 'Connection refused');
      } else {
        throw createError(408, 'Request timeout');
      }
    } else {
      // Something happened in setting up the request that triggered an Error
      const statusText =
        process.env.NODE_ENV === 'production'
          ? 'Internal server error'
          : error.message;

      throw createError(500, statusText);
    }
  }
};

module.exports = scraper;
