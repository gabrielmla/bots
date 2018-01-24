var request = require('request');
var cheerio = require('cheerio');
var URL = require('url-parse');
var async   = require('async');

var START_URL = "http://partagecampina.com.br/site/cinema/";
var BASE_URL  = "http://partagecampina.com.br/site/filme/";
var SEARCH_WORD = "stemming";
var MAX_PAGES_TO_VISIT = 15;

var movies = [];

var linksFound = false;
var numPagesVisited = 0;
var pagesToVisit = new Set();
var url = new URL(START_URL);
var baseUrl = url.protocol + "//" + url.hostname;

pagesToVisit.add(START_URL);
crawl();

function crawl() {
  if(numPagesVisited >= MAX_PAGES_TO_VISIT || pagesToVisit.length <= 0) {
    console.log("Reached max limit of number of pages to visit.");
    console.log(movies);
    return;
  }
  console.log(pagesToVisit);
  
  if (!linksFound) {
    nextPage = START_URL;
  } else {
    pagesToVisit = Array.from(pagesToVisit);
    var nextPage = pagesToVisit.pop();
  }

  visitPage(nextPage, crawl);
}

function visitPage(url, callback) {
  // Add page to our set
  numPagesVisited++;

  // Make the request
  console.log("Visiting page " + url);
  request(url, function(error, response, body) {
    // Check status code (200 is HTTP OK)
    console.log("Status code: " + response.statusCode);
    if(response.statusCode !== 200) {
      callback();
      return;
    }
    // Parse the document body
    var $ = cheerio.load(body);
    movies.push(collectMovies($));

    if (!linksFound) {
      collectInternalLinks($);
      linksFound = true;
    }
    // In this short program, our callback is just calling crawl()
    callback();
  });
}

function searchForWord($, word) {
  var bodyText = $('html > body').text().toLowerCase();
  return(bodyText.indexOf(word.toLowerCase()) !== -1);
}

function collectInternalLinks($) {
  var absoluteLinks = $("a[href^='" + BASE_URL + "']");
  absoluteLinks.each(function() {
      pagesToVisit.add($(this).attr('href'));
  });
}

function collectMovies($) {
  var mDetails = [];
  var mSession = [];
  var mTitle = "Título: " + $('html > body').find('div > h1').text();
  mDetails.push(mTitle);
  var body = $('html > body').find('div.wpb_row').each(function (index) {
    $(this).find('div.wpb_wrapper').each(function (index) {
      if ($(this).children().length == 6) {
        $(this).find('div').each(function (index) {
          mDetails.push($(this).text().trim());
        });
      }
    });
    
    $(this).find('tr > td').each(function (index) {
      mSession.push($(this).text());
    });
  });
  //console.log(movieJSON(mDetails, mSession));
  var movie = movieJSON(mDetails, mSession);
  return movie;
}

function movieJSON(details, session) {
  var json = { title: '', description: '', genre: '', oriTitle: '', director: '', duration: '', distributor: '', sessions:[] };
  var keys = Object.keys(json);
  var sessions = keys.pop();
  for (i = 0; i < details.length; i++) {
    var key = keys[i];
    if (json.hasOwnProperty(key)) {
      json[key] = details[i];
    };
  }
  for (i = 0; i < session.length; i += 2) {
    var aux = session[i] + " " + session[i+1];
    json[sessions].push(aux);
  }
  return json;
}