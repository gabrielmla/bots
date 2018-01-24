var request = require('request');     // Request is used to make HTTP requests.
var cheerio = require('cheerio');     // Cheerio is used to parse and select HTML elements on the page.
var URL     = require('url-parse');   // URL is used to parse URLs.

var START_URL = "http://partagecampina.com.br/site/filme/viva-a-vida-e-uma-festa-2/";
var pagesVisited = {};
var pagesToVisit = [];
var numPagesVisited = 0;
var url = new URL(START_URL);
var baseUrl = url.protocol + "//" + url.hostname;

pagesToVisit.push(START_URL);
//crawl();

function crawl() {
  var nextPage = pagesToVisit.pop();
  if (nextPage in pagesVisited) {
    // We've already visited this page, so repeat the crawl
    crawl();
  } else {
    // New page we haven't visited
    visitPage(nextPage, crawl);
  }
}

function visitPage(url, callback) {
  // Adicionando page para o set
  pagesVisited[url] = true;
  numPagesVisited++;

  console.log("Visiting page " + url);
  request(url, function(error, response, body) {
     // Verificando se o STATUS da request eh 200 (OK)
     console.log("Status code: " + response.statusCode);
     if(response.statusCode !== 200) {
       callback();
       return;
     }
     // Utilizando o cheerio para fazer parse do html
     var $ = cheerio.load(body);
     var isWordFound = searchForWord($, SEARCH_WORD);
     if(isWordFound) {
       console.log('Word ' + SEARCH_WORD + ' found at page ' + url);
     } else {
       collectInternalLinks($);
       // In this short program, our callback is just calling crawl()
       callback();
     }
  });
}

console.log("Visiting page " + START_URL);
request(START_URL, function(error, response, body) {
   if(error) {
     console.log("Error: " + error);
   }
   // Check status code (200 is HTTP OK)
   console.log("Status code: " + response.statusCode);
   if(response.statusCode === 200) {
     // Parse the document body
     var $ = cheerio.load(body);
     console.log("");
     collectMovies($);
     //collectInternalLinks($);
   }
});

/*function collectInternalLinks($) {
  var allRelativeLinks = [];
  var allAbsoluteLinks = [];

  var relativeLinks = $("a[href^='/']");
  relativeLinks.each(function() {
      allRelativeLinks.push($(this).attr('href'));

  });

  var absoluteLinks = $("a[href^='http']");
  absoluteLinks.each(function() {
      allAbsoluteLinks.push($(this).attr('href'));
  });

  console.log("Found " + allRelativeLinks.length + " relative links");
  console.log("Found " + allAbsoluteLinks.length + " absolute links");
}

function searchForWord($, word) {
  var bodyText = $('html > body').text();
  if(bodyText.toLowerCase().indexOf(word.toLowerCase()) !== -1) {
    return true;
  }
  return false;
}*/

function collectInternalLinks($) {
    var absoluteLinks = $("a[href^='http']");
    console.log("Found " + absoluteLinks.length + " relative links on page");
    absoluteLinks.each(function() {
        allAbsoluteLinks.push($(this).attr('href'));
    });
}

function collectMovies($) {
  var mDetails = [];
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
    var mSession = [];
    $(this).find('tr > td').each(function (index) {
      mSession.push($(this).text());
    });
    console.log(movieJSON(mDetails, mSession));
    //console.log(movieJSON(mDetails));
    if (mTitle && mDetails && mSession) {
        //var movie = {title: mTitle, description: mDescription, session: mSession};//, genre: mGenre, director: mDirector, lenght: mLenght};
        //movies.push(movie);
    }
  });
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
