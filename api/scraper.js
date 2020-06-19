// const createError = require('http-errors')
// const status = require('statuses')
const metascraper = require('metascraper')([
  // require('metascraper-soundcloud')(),
  require('metascraper-author')(),
  require('metascraper-date')(),
  require('metascraper-description')(),
  // require('metascraper-image')(),
  // require('metascraper-logo')(),
  require('metascraper-clearbit')(),
  // require('metascraper-publisher')(),
  // require('metascraper-title')(),
  // require('metascraper-url')(),
  // require('./metascraper-readability-modified')(),
  // require('metascraper-publisher')(),
  // require('metascraper-amazon')(),
  // require('metascraper-audio')(),
  // require('metascraper-lang')(),
  // require('metascraper-logo-favicon')(),
  // require('metascraper-media-provider')(),
  // require('metascraper-uol')(),
  // require('metascraper-spotify')(),
  // require('metascraper-video')(),
  // require('metascraper-youtube')(),
  // require('metascraper-iframe')(),
]);

const axios = require('axios');

const targetUrl = 'htts://soundcloud.com/staysolidrocky/party-girl1';

const scrapper = async () => {
  try {
    const response = await axiosfetch(targetUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:15.0) Gecko/20100101 Firefox/77.0.1',
      },
    });
    const url = response.request.res.responseUrl;
    const html = response.data;
    const metadata = await metascraper({ html, url });
    console.log(metadata);
  } catch (error) {
    if (error.response) {
      // Request made and server responded
      const { status, statusText } = error.response;
      createError(status, statusText);
    } else if (error.request) {
      // The request was made but no response was received
      console.log(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      // createError(500, 'Internal Server Error')
      console.log('Error', error.message);
    }
  }
};

scrapper();

// only accept html web pages
