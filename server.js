var express = require('express'),
	bodyParser = require('body-parser'),
	app = express(),
	request = require('request');

var fs = require('fs');

function incrementViewCount(req, res, next) {
	fs.readFile('viewCount.json', function(err, data) {
		var viewData = {count:1, timestamp: new Date()};
		if(!err) {
			try {
				viewData = JSON.parse(data);
				viewData.count++;
			}
			catch(e) {
				viewData = {count:1, timestamp: new Date()};
			}
		}
		output = JSON.stringify(viewData);
		fs.writeFile('viewCount.json', output, function(err) {
			next();
		});
	});
}

function getViewCount(req, res) {
	fs.readFile('viewCount.json', function(err, data) {
		if (!err) {
			try {
				var viewData = JSON.parse(data);
				res.write(viewData.count + ' views since ' + viewData.timestamp);
				res.end();
			}
			catch(e) {
				res.send('data read error');
			}
		}
		else {
			res.send('no data');
		}
	});
}

function proxyJSON(req, res) {

	if(!req.body.targetUrl) {
		res.json({proxyError:'missing targetUrl'});
		res.end();
		return;
	}

	request({
		url: req.body.targetUrl,
		json: true
	}, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			res.json(body);
		} else {
			res.json({proxyError:error});
		}
		res.end();
	});
}

function redirectIfNeeded(req, res, next) {
	if(req.header('host').indexOf('herokuapp.com') > -1) {
		res.redirect(301, 'http://www.destinyrep.com');
	} else {
		next();
	}
}

app.get('/', redirectIfNeeded);
app.get('/', incrementViewCount);
app.use(express.static('public'));
app.use(bodyParser.json());
app.get('/viewcount', getViewCount);
app.post('/proxyJSON', proxyJSON);

var listenPort = process.env.PORT || 5000;
app.listen(listenPort);
console.log('Listening on port ' + listenPort);
