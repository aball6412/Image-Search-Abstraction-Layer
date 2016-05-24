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
var url = process.env.MONGOLAB_URI || "mongodb://localhost:27017/image_search_abstraction_layer";




//Connect to MongoDB
MongoClient.connect(url, function(err, db) {
    
    if(err) {
        console.log("Unable to connect to database: " + url);
    }
    else {
        console.log("Successfully connected to: " + url);
        
     //Use collection variable to hold db connection to db.collection
    collection = db.collection("searchQueries");
        
    }

}); //End db connection





//Serve static files to client (index.html)
app.use("/", express.static(__dirname + "/public"));

app.get("/api/latest/imagesearch", function(request, response) {
    
    
    //Query the database
    collection.find().sort().toArray(function(err, documents) {
        
        if(err) throw err;
        
        documents = documents.sort(function(a, b) {
            
            a = Date.parse(a.Date);
            b = Date.parse(b.Date);
            
            return b - a;  
        });
        
        //Limit response to last 10 search results
        var doclimit = [];
        
        for (var i = 0; i < 10; i++) {
            doclimit.push(documents[i]);
        }
        
        response.send(doclimit);
        
    });

    
    
});


//Get search results
app.get("/api/:search", function(request, response) {
    
    //lstresult will get the full search result
    var lstresult = [];
    //displaylst will display first ten results or whatever page is requested via offset parameter
    var displaylst = [];
    
    //Get search query and page number (if there is one)
    var search = request.params.search;
    var page = Number(request.query.offset);

   
    
    //Save search query and date to Mongodb
    var date = Date.now();
    date = new Date(date);

    collection.insert ( 
        { 
            "Term": search, 
            "Date": date.toGMTString() 
        }
    );
    
    
    
    //Set up API options
    var options =
        {
            hostname: "api.imgur.com",
            path: "/3/gallery/search/time/1?q_exactly=" + search,
            headers: { "Authorization": "Client-ID 8e5de034f0e9493" }
        }
    
    //Make the http request to imgur
    https.request(options, function(res) {
        
        //Set string variable to hold results
        var str = "";
        
        
        //Get the data and concatenate it all into a single string
        res.on("data", function(chunk) {
            str += chunk;
        });
        
        
        res.on("end", function() {
            
            //Parse data string and format result variable into a state that we can loop over
            var result = JSON.parse(str);
            result = result.data;

            //Take the result data and format desired parts into javascript objects
            for (var i=0; i < result.length; i++) {
                
                display = {
                    "title": result[i].title,
                    "url": "http://imgur.com/user/" + result[i].account_url,
                    "img.link": result[i].link
                }
                
                //Add objects to our master list of all results
                lstresult.push(display);
                
            }

            console.log("All data received");
            console.log(result.length + " results");

            //Given the page number, find which search result to start on and then list 10
            //If there are not 10 results then break after the last one
            if (Number.isInteger(page)) {
                page = ((page-1) * 10);
                for (var j = page; j < (page + 10); j++) {
                    if (lstresult[j] === undefined) {
                        break;
                    }
                    else {
                        displaylst.push(lstresult[j]);
                    }
                }
            }
            else {
                for (var j = 0; j < 10; j++) {
                    if (lstresult[j] === undefined) {
                        break;
                    }
                    else {
                        displaylst.push(lstresult[j]);
                    } 
                }
 
            }
            
            //If there are results on the page then display them. If not then ERR
            if (displaylst.length === 0) {
                var error_msg = {
                    "error": "No search results on this page. Try a lower page number."
                }
                response.send(error_msg);
            }
            else {
                response.send(displaylst);
            }
        }); //End res.on("end")
        
        
    }).end();


    
}); // End app.get("/api/:search)



app.listen(port);










