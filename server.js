var express = require('express');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

var logger = require('morgan');
var mongoose = require('mongoose');
// Notice: Our scraping tools are prepared, too
var request = require('request'); 
var cheerio = require('cheerio');


var app = express();

//Serve static content for the app from the "public" directory in the application directory.
app.use(express.static(process.cwd() + '/public'));
app.use(logger('dev'));
app.use(bodyParser.urlencoded({
	extended: false
}));
// override with POST having ?_method=DELETE
app.use(methodOverride('_method'));
var exphbs = require('express-handlebars');


/////////////////////////////////////////
// mongoose.connect('mongodb://localhost/week18hw');
// var db = mongoose.connection;

// // show any mongoose errors
// db.on('error', function(err) {
//   console.log('Mongoose Error: ', err);
// });

// // once logged in to the db through mongoose, log a success message
// db.once('open', function() {
//   console.log('Mongoose connection successful.');
// });


// // And we bring in our Note and Article models
// var Note = require('./models/Note.js');
// var Article = require('./models/Article.js');
///////////////////////////////////////


app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

var routes = require('./controllers/controller.js');
app.use('/', routes);


var PORT = process.env.PORT || 5000;
app.listen(PORT, function(){
  console.log("listening on port: "+ PORT);
});
