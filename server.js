var express = require('express');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

var logger = require('morgan');
var mongoose = require('mongoose');

var request = require('request'); 
var cheerio = require('cheerio');


var app = express();


app.use(express.static(process.cwd() + '/public'));
app.use(logger('dev'));
app.use(bodyParser.urlencoded({
	extended: false
}));

app.use(methodOverride('_method'));
var exphbs = require('express-handlebars');


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
