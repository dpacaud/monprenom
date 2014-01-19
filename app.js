var restify = require('restify');

var mongodb = require('mongodb');

//var MONGOHQ_URL="mongodb://localhost/prenoms";

var globalClient;

mongodb.Db.connect(MONGOHQ_URL, function(error, client) {  
		if (error) {
			throw error;
		}
		else {
			globalClient = client;
		}
});


function respondRandom(req, res, next) {
		findRandomFirstName(function(doc){				
			res.send(doc);
		});
}

function respondListFirstNamesByYear(req,res,next) {
	listFirstNamesByYear(req.params.year,function(doc){				
			res.send(doc);
		});
}

function respondListYearsByFirstName(req,res,next) {
	listYearsByFirstName(req.params.firstName,function(doc){				
			res.send(doc);
		});
}

function respondAddSex(req,res,next) {
	//console.log(req.params);
	setSex(req.params.firstName,req.body.sex,function(){
		res.send("ok");		
	})
}

function respondStatus(req,res,next) {
	res.send({date : new Date(),
		status : 'ok'});
}

var server = restify.createServer();
server.use(restify.bodyParser({ mapParams: false }));
server.use(restify.CORS());
server.use(restify.fullResponse());

// routes definition
server.get('/random/', respondRandom);
server.get('/year/:year', respondListFirstNamesByYear);
server.get('/firstName/:firstName', respondListYearsByFirstName);
server.get('/status',respondStatus);

server.post('/:firstName/', respondAddSex);



// Let that server run
server.listen(process.env.PORT || 5000, function() {
  console.log('%s listening at %s', server.name, server.url);
});


function findRandomFirstName(callback){
	globalClient.collection("listePrenoms", function(error,collection){
		if (error) throw error;
		var rand = Math.random();
		//console.log(rand);
		collection.findOne({random : { $gte : rand } },function(error,doc){
			if (error) throw error;

			if ( doc == null ) {
		   		collection.findOne( { random : { $lte : rand } }, function(error,doc){
					if (error) throw error;					
					console.log("we found : " + doc.prenom + " after a retry :(");
 					callback({prenom:doc.prenom,quantite:doc.quantite});
				});
 			}	
 			else{
 				callback({prenom:doc.prenom,quantite:doc.quantite});
 			}
		});

	});
}

function listYearsByFirstName(name,callback){
	globalClient.collection("listePrenoms", function(error,collection){
		if (error) throw error;

		collection.find({prenom:name.capitalize()},{prenom:1,annee:1,quantite:1,_id:0}).toArray(function(error,doc){
			if (error) throw error;

			if ( doc.length === 0 ) {
		   		console.log("doc is empty");
 			}	
 			else{
 				var ret = {};
 				ret.prenom = doc[0].prenom;
 				ret.annees = doc; 
 				callback(ret);
 			}
		});

	});	
}

function listFirstNamesByYear(year,callback){
	globalClient.collection("listePrenoms", function(error,collection){
		if (error) throw error;

		collection.find({annee:parseInt(year)}).toArray(function(error,doc){
			if (error) throw error;

			if ( doc == null ) {
		   		console.log("doc is null")
 			}	
 			else{
 				//console.log(doc);
 				callback(doc);
 			}
		});

	});	
}


function setSex(firstName,sex,callback){
	globalClient.collection("listePrenoms", function(error,collection){
		if (error) throw error;
		
		collection.update({"prenom":firstName.capitalize()},{$set:{"sex":sex}},{w:1,multi: true},function(err,result){
			console.log(result);
            if(err) throw err;

            callback();
          });

	});	
}

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}
