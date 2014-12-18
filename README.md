# jade-static-cache #
``jade-static-cache`` is Express middleware combined with a Jade filter that can be used to 
easily apply far future cache-control headers to your static files. When a file is modified, 
its URL will be modified, forcing the browser to refetch the file.

## Installation ##

```bash
$ npm install jade-static-cache
```

## How to Use ##
This module currently supports Express 3.

```js
var express = require('express');
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
```

``static`` takes two parameters: The first is the root directory where your static
files are located. The second is the URL path that will be used to serve your static
files. By default, jade-static-cache runs in production mode. Running in dev mode can
be achieved by passing in ``true`` as an optional third parameter.

## In your Jade template

```jade
:staticCache
  link(rel='stylesheet', href='/css/main.css')
  script(src='/scripts/base.js')
```

In production mode, this will render

```html
<link rel="stylesheet" href="/cache/4dsd6-8866610372/css/main.css">
<script src="/cache/4d66-888010372/css/main.css"></script>
```

In dev mode, this will render:

```html
<link rel="stylesheet" href="/css/main.css">
<script src="/css/main.css"></script>
```

In both cases, the appropriate response with be sent to the browser along with a 
cache-control header that has a max-age value of 1 year. This will prevent the browser 
from making future requests for the file.

If the file is modified in the future, the production URL will also be modified. Note 
that you will need to restart your server for this to take effect.