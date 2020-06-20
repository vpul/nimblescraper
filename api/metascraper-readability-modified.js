const { memoizeOne } = require('@metascraper/helpers');
const Readability = require('readability');
const jsdom = require('jsdom');

const { JSDOM, VirtualConsole } = jsdom;

const readabilityScraper = () => {
  const composeRule = (fn) => ({ from, to = from, ...opts }) => async ({
    htmlDom,
    url,
  }) => {
    const data = await fn(htmlDom, url);
    if (data) {
      return data[from];
    }
  };

  const readability = memoizeOne(($, url) => {
    const dom = new JSDOM($.html(), {
      url,
      virtualConsole: new VirtualConsole(),
    });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    /*
      This article object will contain the following properties:
      title: article title
      content: HTML string of processed article content
      length: length of an article, in characters
      excerpt: article description, or short excerpt from the content
      byline: author metadata
      dir: content direction
    */
    return article;
  });

  const getReadbility = composeRule(readability);

  const rules = {
    description: getReadbility({ from: 'excerpt', to: 'description' }),
    publisher: getReadbility({ from: 'siteName', to: 'publisher' }),
    author: getReadbility({ from: 'byline', to: 'author' }),
    title: getReadbility({ from: 'title' }),
    dir: getReadbility({ from: 'dir' }),
    length: getReadbility({ from: 'length' }),
    content: getReadbility({ from: 'content' }),
  };
  return rules;
};

module.exports = readabilityScraper;
