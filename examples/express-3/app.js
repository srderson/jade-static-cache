var express = require('express')
var path = require('path');
var jadeStaticCache = require('jade-static-cache');
var app = express();

var staticDir = path.join(__dirname, 'static');

app.use(jadeStaticCache.static(staticDir, '/cache'));

app.use(express.static(staticDir));
app.use(app.router);
app.set('view engine', 'jade');

app.get('/', function(req, res){
	res.render('index');
});

app.listen(3000);