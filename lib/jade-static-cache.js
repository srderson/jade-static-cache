var fs = require('fs');
var jadeFilters = require('jade/lib/filters');
var jade = require('jade');
var crc32 = require('buffer-crc32');

/**
 *
 * @param dir {String} The directory that contains static files 
 * @param url {String} The URL from which the files will be served
 * @param devModel {Boolean} True to not cache files.
 */
exports.static = function(dir, url, devMode) {

	if(arguments.length < 2) {
		throw new Error('This function requires two arguments.'
			+ '\n1. The directory from which to load the static files.'
			+ '\n2. The URL to serve the static files from.')
	}

	// if dir ends with '/', remove the '/'
	if(dir.indexOf('/', dir.length - 1) !== -1) {
		dir = dir.substring(0, dir.length - 1);
	}

	// If the URL doesn't end with a '/', add a '/'
	if(url.indexOf('/', url.length - 1) === -1) {
		url = url + '/';
	}
	var urlLength = url.length;

	// Map of files names with path -> CRC
	var files = {};
	_loadFiles(dir.length, dir, files);

	// Jade filter. 
	jadeFilters.staticCache = function(text) {

		if(!devMode) {
			// Find href and src attributes
			// Example match is script(src='/scripts/base.js')
			// $1 = src='
			// $2 = /scripts/base.js
			// $3 = '
			text = text.replace(/((?:src|href)=['"])([^'"]+)(["'])/g, function(match) {
				if(arguments.length < 4) {
					return match;
				} else {
					var crc = files[arguments[2]];
					if(crc) {
						// Replace the value path with the provided URL and file CRC
						return arguments[1] + url + crc + arguments[2] + arguments[3];
					} else {
						return match;
					}
				}
			});
		}
		return jade.render(text);
	}

	return function(req, res, next) {

		// If this patch starts with url
		if(req.path.lastIndexOf(url, 0) === 0) {
			var pathIndex = req.path.indexOf('/', urlLength);
			if(pathIndex > urlLength) {
				var path = req.path.substring(pathIndex);
				// Found the file and it's CRC. Send it
				if(files[path]) {
					// Set Cache-Control header to 1 year
					res.setHeader('Cache-Control', 'public, max-age=31536000');
					res.sendfile(dir + path);
				} else {
					res.send(404);
				}
			} else {
				res.send(404);
			}
		} else {
			return next();
		}
	};

};

// Load the files in the specified directort and create a map of File -> CRC
function _loadFiles(startDirLength, dir, files) {
	var dirFiles = fs.readdirSync(dir);
	if(dirFiles) {
		for(var i=0; i<dirFiles.length; i++) {
			if(fs.statSync(dir + '/' + dirFiles[i]).isDirectory()) {
				// Directory, load it's children
				_loadFiles(startDirLength, dir + '/' + dirFiles[i], files);
			} else {
				// File, calculatethe CRC
				var filePath = dir + '/' + dirFiles[i];
				var fileBuffer = fs.readFileSync(filePath);
				var fileLength = fileBuffer.length;
				var fileETag;
				if(fileLength === 0) {
					// quick CRC for empty files
					fileETag = '0-0';
				} else {
					fileETag = fileLength.toString(16) + '-' + crc32.unsigned(fileBuffer);
				}
				// Add path + file name to map with CRC as value
				files[dir.substring(startDirLength) + '/' + dirFiles[i]] = fileETag;
			}
		}
	}
}