var request = require('request');     // Request is used to make HTTP requests.
var cheerio = require('cheerio');     // Cheerio is used to parse and select HTML elements on the page.
var URL     = require('url-parse');   // URL is used to parse URLs.

var pageToVisit = "http://partagecampina.com.br/site/cinema/";
console.log("Visiting page " + pageToVisit);
request(pageToVisit, function(error, response, body) {
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
     collectInternalLinks($);
     console.log($('html > body').find('div.page-inner').find('div.row-fluid').find('div.span9').find('div.wpb_row').length);
     console.log(searchForWord($, 'Sala'));
   }
});

function collectInternalLinks($) {
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
}

function collectMovies($) {
  var body = $('html > body').find('div.page-inner').find('div.row-fluid').find('div.span9').find('div.wpb_row').each(function (index) {
    var title = $(this).find('h4 > a').text();
    var description = $(this).find('p').text();
    console.log(title);
    console.log(description);
  });
  movies = [];

}
