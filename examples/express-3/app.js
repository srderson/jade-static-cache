var express = require('express')
var jadeStaticCache = require('jade-static-cache');
var app = express();

app.use(jadeStaticCache.static('./static', '/cache'));

app.use(express.static('./static'));

app.use(app.router);
app.set('view engine', 'jade');

app.get('/', function(req, res){
	res.render('index');
});

app.listen(3000);