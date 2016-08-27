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

		else {
			var list = doc;

			request('http://www.echojs.com/', function(error, response, html) {
				var $ = cheerio.load(html);
				$('article h2').each(function(i, element) {

					var result = {};

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

						entry.save(function(err, doc) {
						  if (err) {
						    console.log(err);
						  } 
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
	Article.find({}, function(err, doc){

		if (err){
			console.log(err);
		} 
		else {
			// var hbsObject = {article: doc[0]};
			// console.log(hbsObject);
			// res.render('index', hbsObject);
			res.json(doc);
		}
	});
});

router.get('/articles/:id', function(req, res){

	Article.findOne({'_id': req.params.id})
	.populate('note')
	.exec(function(err, doc){
		if (err){
			console.log(err);
		} 
		else {
			res.json(doc);
		}
	});
});


router.post('/articles/:id', function(req, res){
	var newNote = new Note(req.body);

	newNote.save(function(err, doc){
		if(err){
			console.log(err);
		} 
		else {
			Article.findOneAndUpdate({'_id': req.params.id}, {'note':doc._id})
			.exec(function(err, doc){
				if (err){
					console.log(err);
				} else {
					res.send(doc);
				}
			});
		}
	});
});

module.exports = router;