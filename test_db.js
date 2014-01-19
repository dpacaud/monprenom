var mongodb = require('mongodb');

//var MONGOHQ_URL="mongodb://test:test@dharma.mongohq.com:10034/prenoms";
var MONGOHQ_URL="mongodb://localhost/prenoms";



getFewNames(10,function(finalResult){
	console.log("done");
	console.log(JSON.stringify(finalResult));
})




////
//// This method gets a few names from the DB
//// Treshold parameter dictates how may names to retrieve
////
function getFewNames(treshold,callback) {
	var myNameArray = new Array();
	mongodb.Db.connect(MONGOHQ_URL, function(error, client) {  
		if (error) throw error;

		for(var i=0;i<treshold;i++) {
			var res = findRandomFirstName(client,function(res){				
				myNameArray.push(res);
				//We need to callback only when we have retrieved enough names
				if(myNameArray.length === treshold){
					callback(myNameArray);
					client.close();
				}
			});
		}
	});
}

function findRandomFirstName(client, callback){
	client.collection("listePrenoms", function(error,collection){
		if (error) throw error;
		var rand = Math.random();
		//console.log("random number : " + rand);
		collection.findOne({random : { $gte : rand } },function(error,doc){
			if (error) throw error;

			if ( doc == null ) {
		   		collection.findOne( { random : { $lte : rand } }, function(error,doc){
					if (error) throw error;					
					//console.log("we found : " + doc.prenom);
 					//myNameArray.push(doc.prenom);
 					callback({prenom:doc.prenom,quantite:doc.quantite});
				});
 			}	
 			else{
 				//console.log("we found : " + doc.prenom);
 				//myNameArray.push(doc.prenom);
 				callback({prenom:doc.prenom,quantite:doc.quantite});
 			}
		});

	});
}