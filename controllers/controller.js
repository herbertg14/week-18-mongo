var express = require('express');
var router = express.Router();


var logger = require('morgan');
var mongoose = require('mongoose');

var request = require('request'); 
var cheerio = require('cheerio');

// mongoose.connect('mongodb://localhost/week18test');
mongoose.connect('mongodb://heroku_q4qjncjd:1th6fsi6oqi175dd0g8rkmktqr@ds017726.mlab.com:17726/heroku_q4qjncjd');
var db = mongoose.connection;


db.on('error', function(err) {
  console.log('Mongoose Error: ', err);
});


db.once('open', function() {
  console.log('Mongoose connection successful.');
});

var Note = require('./../models/Note.js');
var Article = require('./../models/Article.js');

router.get('/', function(req, res) {
  res.render('index');
});


router.get('/scrape', function(req, res) {

	Article.find({}, function(err, doc){

		if (err){
			console.log(err);
		} 

		//scrape site and don't add any duplicates
		else {
			var list = doc;

			request('http://www.echojs.com/', function(error, response, html) {
			// then, we load that into cheerio and save it to $ for a shorthand selector
				var $ = cheerio.load(html);
				// now, we grab every h2 within an article tag, and do the following:
				$('article h2').each(function(i, element) {

				// save an empty result object
					var result = {};

					// add the text and href of every link, 
					// and save them as properties of the result obj
					result.title = $(this).children('a').text();
					result.link = $(this).children('a').attr('href');

					var check = false;
					for (var i = 0; i < doc.length; i++){
						if (doc[i].title == result.title){
							check = true;
						}
					}

					if (check){
					console.log("already in table");
					}else{
						var entry = new Article (result);

						// now, save that entry to the db
						entry.save(function(err, doc) {
							// log any errors
						  if (err) {
						    console.log(err);
						  } 
						  // or log the doc
						  else {
						     console.log(doc);
						  }
						});
					}
				});
			});
		}
	});

	res.send("Scrape Complete");
});

// this will get the articles we scraped from the mongoDB
router.get('/articles', function(req, res){
	// grab every doc in the Articles array
	Article.find({}, function(err, doc){
		// log any errors
		if (err){
			console.log(err);
		} 
		// or send the doc to the browser as a json object
		else {
			// var hbsObject = {article: doc[0]};
			// console.log(hbsObject);
			// res.render('index', hbsObject);
			res.json(doc);
		}
	});
});

// grab an article by it's ObjectId
router.get('/articles/:id', function(req, res){
	// using the id passed in the id parameter, 
	// prepare a query that finds the matching one in our db...
	Article.findOne({'_id': req.params.id})
	// and populate all of the notes associated with it.
	.populate('note')
	// now, execute our query
	.exec(function(err, doc){
		// log any errors
		if (err){
			console.log(err);
		} 
		// otherwise, send the doc to the browser as a json object
		else {
			res.json(doc);
		}
	});
});


// replace the existing note of an article with a new one
// or if no note exists for an article, make the posted note it's note.
router.post('/articles/:id', function(req, res){
	// create a new note and pass the req.body to the entry.
	var newNote = new Note(req.body);

	// and save the new note the db
	newNote.save(function(err, doc){
		// log any errors
		if(err){
			console.log(err);
		} 
		// otherwise
		else {
			// using the Article id passed in the id parameter of our url, 
			// prepare a query that finds the matching Article in our db
			// and update it to make it's lone note the one we just saved
			Article.findOneAndUpdate({'_id': req.params.id}, {'note':doc._id})
			// execute the above query
			.exec(function(err, doc){
				// log any errors
				if (err){
					console.log(err);
				} else {
					// or send the document to the browser
					res.send(doc);
				}
			});
		}
	});
});

module.exports = router;