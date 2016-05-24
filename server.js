var https = require("https");
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var express = require("express");
var app = express();
var mongo = require("mongodb");
var MongoClient = mongo.MongoClient;
var collection;


//Set our server port for production and development
var port = process.env.PORT || 3000;

//Set database url for production and development
var url = process.env.MONGOLABS_URI || "mongodb://localhost:27017/image_search_abstraction_layer";


//Connect to MongoDB
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









//Get seach results
app.get("/api/:search", function(request, response) {
    
    var search = request.params.search;
    console.log(search);
    
    //Save search query to Mongodb
    
    
    
    //Connect with outside API
    //Set up API options
    var options =
        {
            hostname: "api.imgur.com",
            path: "/3/gallery/search/time/1?q_exactly=space",
            headers: { "Authorization": "Client-ID 8e5de034f0e9493" }
        }
    
    //Make the http request to imgur
    https.request(options, function(res) {
        
        //Set string variable to hold results
        var str = "";
        res.on("data", function(chunk) {
            str += chunk;

        });
        
        res.on("end", function() {
            
            var result = JSON.parse(str);
            
            //Previous "result" was one object with one array
            //This "result" will be an array-like object that we can loop over
            //We want title, account_url, link variables
            result = result.data;
            
            for (var i=0; i < result.length; i++) {
                
                display = {
                    "title": result[i].title,
                    "url": result[i].account_url,
                    "img.link": result[i].link
                }
                    
                console.log(display);
                
            }
            
            //console.log(result[0]);
            console.log(typeof result);
            console.log(result.length);
            console.log("All data received");
        });
        
        
    }).end();
//    
    

    response.send("<h1>Hello World</h1>");
    
});



app.listen(port);










