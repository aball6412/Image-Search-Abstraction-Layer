var express = require("express");
var app = express();
var mongo = require("mongodb");
var MongoClient = mongo.MongoClient;
var collection;


var port = process.env.PORT || 3000;

var url = "mongodb://localhost:27017/image_search_abstraction_layer";


MongoClient.connect(url, function(err, db) {
    
    if(err) {
        console.log("Unable to connect to database: " + url);
    }
    else {
        console.log("Successfully connected to: " + url);
        
     //Use collection variable to hold db connection to db.collection       
        
    }

}); //End db connection


//Serve static files to client (index.html)
app.use("/", express.static(__dirname + "/public"));





app.listen(port);





