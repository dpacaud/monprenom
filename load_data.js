var fs = require('fs');
var csv = require('csv');
var mongodb = require('mongodb');
var url = require('url');

var MONGOHQ_URL="mongodb://test:test@dharma.mongohq.com:10092/prenoms";
//var MONGOHQ_URL="mongodb://localhost/prenoms";

var connectionUri = url.parse(MONGOHQ_URL);
var dbName = connectionUri.pathname.replace(/^\//, '');
var myArray = new Array();
mongodb.Db.connect(MONGOHQ_URL, function(error, client) {
  if (error) throw error;
  client.collection("listePrenoms", function(error,collection) {
    collection.ensureIndex({prenom:1,annee:1}, function(error){
      if (error) throw error;
    });
    collection.ensureIndex({random:1}, function(error){
      if (error) throw error;
    });
    collection.ensureIndex({prenom:1}, function(error){
      if (error) throw error;
    });
    collection.ensureIndex({annee:1}, function(error){
      if (error) throw error;
    });
  });
    csv()
    .from.stream(fs.createReadStream(__dirname+'/data/prenoms.csv'),{columns:true})
    .on('record', function(row,index){
      if(row.prenom.length > 1 ) {
      
        client.collection("listePrenoms", function(error,collection) {
          if (error) throw error;

          collection.update({"prenom":row.prenom,"annee":parseInt(row.annee)},{$inc:{"quantite":parseInt(row.quantite)},$set:{random:Math.random()}},{upsert:true,w:1},function(err,result){
            if(err) throw err;
          });
        });
      }
      else {
        console.log("found a one letter firstName, ignoring it  : " + row.prenom);
      }
    })
    .on('end', function(count){
      console.log('Number of lines: '+count);
    })
    .on('error', function(error){
      console.log(error.message);
    });    

});





