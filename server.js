var express = require('express');
var request = require('request');
var moment = require('moment');
var mongo = require('mongodb').MongoClient;
var app = express();
var cse = 'https://www.googleapis.com/customsearch/v1?q='
var cx = '&cx=017945690503629750846%3A_r5tyj5a5u0&num=10&searchType=image';
var num = '&start=';
var cse2= '&key=AIzaSyDCzT1fcI1TBp-2DhyWg4Z8pmC0_j-5FtA';
var mongoURL = 'mongodb://admin:admin@ds127899.mlab.com:27899/images'

app.get('/api/latest/',(req,res)=>{
	mongo.connect(mongoURL, (err,client)=>{
		if(err) throw err;
		var db = client.db('images');
		db.collection('latest').find().sort({ $natural: -1 }).limit(10).project({_id:0}).toArray((err,data)=>{
			if (err) throw err;
			res.send(data);
			client.close();
		})
	})
})

app.get('/api/:search',(req,res)=>{
	var offset = req.query.offset;
	var search = req.params.search;
	mongo.connect(mongoURL, (err,client)=>{
		if(err) throw err;
		var db = client.db('images');
		var objt = {
			'query' : search,
			'when' : moment.utc().format()
		}
		db.collection('latest').insert(objt);
		client.close();
	})
	var google = cse + search + cx + num + offset + cse2;
	var display = {
		0 : {},
		1 : {},
		2 : {},
		3 : {},
		4 : {},
		5 : {},
		6 : {},
		7 : {},
		8 : {},
		9 : {}
	};
	request(google, { json: true }, (err, response, body) => {
		if(err) throw err;
		for(let x = 0; x < 10; x++){
			display[x].title = body.items[x].title;
			display[x].url = body.items[x].link;
			display[x].context = body.items[x].image.contextLink;
			display[x].thumbnail = body.items[x].image.thumbnailLink;
		}
		res.json(display);
});

})

app.get('/*', (req,res)=>{
	res.JSON({xxx: 'Usage : https://young-shore-36691.herokuapp.com/api/<termToSearch>?offset=<startListInX>',
		latest : 'You can see the latest searches in https://young-shore-36691.herokuapp.com/api/latest'})
})

app.listen(process.env.PORT || 1337);

