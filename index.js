//-------------general set up----------
var express = require ('express');
var bodyParser= require ('body-parser');
var validator = require ('express-validator');
var session = require ('express-session');
const expressSanitizer = require('express-sanitizer');
const app = express();
const port = 8000;
app.use(expressSanitizer());
app.use(bodyParser.urlencoded({ extended: true }))
//------------------------session management---------------------
app.use(session({
    secret: 'somerandomstuffs',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 600000
    }
}));

//---------routes setup-----------------
require('./routes/main')(app);
app.set('views',__dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
/////////////////////////////////////////////////////////////////////////////
app.listen(port, () => console.log(`Example app listening on port ${port}!`))
//---------------mongoDB database-----------------
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost/recipebank";
MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  console.log("Database created!");
  db.close();
});


