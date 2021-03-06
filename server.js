// server.js
//init project

const MongoClient = require('mongodb').MongoClient; 
const mongomLab = process.env.MONGOLAB_URI;

var express = require('express');
var path = require('path');
var shortid = require('shortid'); //to get unique urls
var validUrl = require('valid-url'); //to verify valid urls

var app = express();


//initialize port values
//var port = process.env.PORT || 8080;

//to access style.css
app.use(express.static('public'));

//to get index.html
app.get('/', (req, res) => { 
   res.sendFile(path.join(__dirname, '/views/index.html')); 
}); 

//get url parameter value from browser
app.get('/new/:urlParam(*)', function(req, res, next){

   //get url parameters from browser
   var urlParam = req.params.urlParam; 
   console.log(urlParam + " URL Entered in Browser");


   //connect to mongoclient mlab database
   MongoClient.connect(mongomLab, (err, db) => {
      if (err){
         return console.log('Unable to connect to Mongo mLab server', err);
      } else {
         console.log('Connected to Mongo mLab server: ', mongomLab);
      }
      
      //declare and initialize urls collection
      var collection = db.collection('urls');

      //function to import url browser parameter to database and returns short url
      var newUrl = function (db, callback){

         //if url is valid generate a shorturl
         if(validUrl.isUri(urlParam)){
             
            var shortUrl = shortid.generate();

            //new object to create database keys to insert url browser parameters into database
            var convertUrl = {
               url: urlParam, //pass parameters values from browser
               short: shortUrl //add shortened url
            };
           
          
           //insert url parameters to database collection
           collection.insert([convertUrl]);

         
           //send response as json 
           console.log(shortUrl + " Shortened URL");
           console.log(urlParam + " URL entered browser");
           res.json({original_url: urlParam, short_url: "https://urlshortener-fccproject.glitch.me/" + shortUrl}); 

         } 
        if (shortUrl){
           return urlParam;
        }
        else {
           //if URL is invalid send error response as json 
            res.json({error: "Invalid URL format.  Include the 'http://www.' format and try again."}); 
             
         };
        
      };//newUrl function

      //function to close database
      newUrl(db, function() {
         db.close();
     
      });
      
   });//mongo connection
});//get urlParam

//function to redirect short url to the original url
app.get('/:short', function(req, res, next){

   //get url parameters from browser
   var short = req.params.short; 
   console.log(short + " Short URL generated by database");


   //connect to mongoclient mlab database
   MongoClient.connect(mongomLab, (err, db) => {
      if (err){
         return console.log('Unable to connect to Mongo mLab server', err);
      } else {
         console.log('Connected to Mongo mLab server: ', mongomLab);
      }
      
      //declare and initialize urls collection
      var collection = db.collection('urls');

      //function to redirect short url
      var redirectUrl = function (db, callback){
  
         //function to find short parameter in the urls collection
         collection.findOne({ short: short }, {url: 1, _id: 0}, function (err, findUrl) {
        
            if(findUrl != null) {
             
               console.log(short + " Short URL ");
               //redirect short url to original url
               res.redirect(findUrl.url); //.url database key value

            } else {
            res.json({ error: "Short URL not found in database." });

            }
         });//collection findOne
      }
     
      //function to close database
      redirectUrl(db, function() {
         db.close();
      });

   });//mongo connection
});//get short


// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('URL Shortener app is listening on port ' + listener.address().port);
});
