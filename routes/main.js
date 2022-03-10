
module.exports = function(app)
{
//---------session management------------------------
const redirectLogin = (req, res, next) => {
//redirects the user to the login page if they arent logged in and try to access certain pages
  if (!req.session.userId ) {
    res.redirect('./login')
  } else { next (); }
  }
//-----------validation +sanitisation-------------------
//sets up the validator
const { check, validationResult } = require('express-validator');


//---------------------routes(get)---------------------------------
     app.get('/',function(req,res){
	//home page
        res.render('index.html')
     });
     app.get('/about',function(req,res){
	//about page
        res.render('about.html');
     });
     app.get('/search',redirectLogin,function(req,res){
         //search page
         res.render("search.html");
     });

     app.get('/search-result', function(req, res) {
         //searching in the database, displays result of search
     	var MongoClient = require('mongodb').MongoClient;
     	var url = 'mongodb://localhost';
     	MongoClient.connect(url, function (err, client) {
     	if (err) throw err;
      	 var db = client.db('recipebank');
	 //searches for values with the same name
	 var query = {name: req.query.keyword};
	 //database is searched through using the keyword entered
      	 db.collection('recipes').find(query).toArray(function(err, result) {
      	 if (err) throw err;
	 else
	 //console.log(result);
	 //displays the search results page which will display the recipe searched for 
	 res.render('search-results.ejs', {availablerecipes:result});
      	 client.close();
  });
});
});
	

     
     app.get('/register', function (req,res) {
	//register page
         res.render('register.html');                                                                     
     });
     app.get('/addrecipe',redirectLogin, function(req,res){
	//add recipe page
	res.render('addrecipe.html')
     });
     app.get('/deleterecipe', redirectLogin, function(req,res){
	//delete recipe page
	res.render('deleterecipe.html')
     });

     app.get('/updaterecipe', redirectLogin, function(req,res){
	//update recipe page
        res.render('updaterecipe.html')
     });

     app.get('/login', function (req,res) {
	//login page
         res.render('login.html');
      });
	
     app.get('/list',redirectLogin, function(req, res) {
     //list page
     var MongoClient = require('mongodb').MongoClient;
     var url = 'mongodb://localhost';
     MongoClient.connect(url, function (err, client) {
     if (err) throw err;
      var db = client.db('recipebank');
      //searches the recipe collection and displays all contents
      db.collection('recipes').find().toArray((findErr, results) => {
      if (findErr) throw findErr;
      else
	//displays the list page which will show all of the recipes to the user
         res.render('list.ejs', {availablerecipes:results});
      client.close();
  });
});
});

     app.get('/logout', redirectLogin, (req,res) => {
    //logout page, ends the current session and displays a message to the user. If they arent logged in it redirects them to home
     req.session.destroy(err => {
     if (err) {
       return res.redirect('./')
     }
     res.send('you are now logged out. <a href='+'./'+'>Home</a>');
     })
     })
                                                                        
//--------------------routes(post)-----------------------------------                         
     app.post('/registered',[check('email').isEmail()], function(req,res)  {
	//validation for email address,checks if its a valid email entered
	const errors = validationResult(req);
	if (!errors.isEmpty()){
	 res.redirect('./register');
	}
	else {
         // saving user data in database, displays output message to user to welcome them
         var MongoClient = require('mongodb').MongoClient;
         var url = 'mongodb://localhost';
	 const bcrypt = require('bcrypt');
	 const saltRounds = 10;
	//sanitises password
	 const plainPassword = req.sanitize( req.body.password);
	 //hashes the password
	 bcrypt.hash(plainPassword, saltRounds, function(err, hashedPassword) {

        MongoClient.connect(url, function(err, client) {
         if (err) throw err;
	//adds the users details to as an account to the user collection on the database
          var db = client.db ('recipebank');
         db.collection('users').insertOne({
         name: req.body.username,
	 password: req.body.password,
	 hashPassword: hashedPassword,
         email: req.body.email
         });
         client.close();
	})
	//displays a message to the user to let them know they have registered successfully
         res.send(' Welcome '+ req.body.username + ' you are now registered! Your password is' + req.body.password + ' and your hashed password is: ' + hashedPassword +  ' You wil be sent an email at ' + req.body.email + '<br />'+'<a href='+'./'+'>Home</a>');                                                                                  
     });
     };
     });

//----------------------------------recipe managements-----------------------------------------	

     app.post('/recipeadded', function (req,res) {
       // saving data in database
       var MongoClient = require('mongodb').MongoClient;
       var url = 'mongodb://localhost';
                                                                                                              
       MongoClient.connect(url, function(err, client) {
        if (err) throw err;
        var db = client.db ('recipebank');  
	//inserts the recipe information to the recipes collections aswell as the userid of the person logged in
        db.collection('recipes').insertOne({
        name: req.body.name,
        ingredients: req.body.ingredients,
        method: req.body.recipe,
	userid: req.session.userId                                                                                                 
        });
        client.close();
	//displays output message to tell user it has been successfully added
        res.send(' This recipe is added to the database : '+ req.body.name + '<br />'+'<a href='+'./'+'>Home</a>');
        });
       });

      app.post('/recipedeleted', function (req,res) {
       // deleting a recipe from database
       var MongoClient = require('mongodb').MongoClient;
       var url = 'mongodb://localhost';

       MongoClient.connect(url, function(err, client) {
        if (err) throw err;
        var db = client.db ('recipebank');
	var myquery = {name: req.body.name};
	//deletes a singular recipe from the database
        db.collection('recipes').deleteOne(myquery, function(err,obj){
	if (err) throw err;
        client.close();
	//outputs message to user to let them know it has been successfully deleted
        res.send(' This recipe has been deleted from the database : '+ req.body.name + '<br />'+'<a href='+'./'+'>Home</a>');
        });
       });
});
     app.post('/recipeupdated', function (req,res) {                                                                             // updating a recipe in the database
       var MongoClient = require('mongodb').MongoClient;
       var url = 'mongodb://localhost';

       MongoClient.connect(url, function(err, client) {
        if (err) throw err;
        var db = client.db ('recipebank');
	var myquery = {name: req.body.name};
	//searches for the recipe matching the name inputted and updates its information to the new information inputted
	var newrecipe = { $set: {name:req.body.name, ingredients:req.body.ingredients, method:req.body.method}};
        db.collection('recipes').updateOne(myquery, newrecipe, function(err, res){
	if (err) throw err;
        client.close();
	//displays an output message to the user to let them know its been updated successfully
        res.send(' This recipe has been updated');
        });
       });
});



	
  app.post('/loggedin', function (req,res) {
          const saltRounds = 10;
          const plainPassword = req.body.password;
          const bcrypt  = require ('bcrypt');
          bcrypt.hash(plainPassword, saltRounds, function(err, hashedPassword) {
          // check form data hashed password with the password saved in DB
          if (err) throw err;
          var MongoClient = require('mongodb').MongoClient;
          var url = 'mongodb://localhost';
          MongoClient.connect(url, function(err, client) {
          if (err) throw err;
          var db = client.db ('recipebank');
          db.collection('users').findOne({name: req.body.username} ,function(err, result) {
          if (err) throw err;
           if(result == null){
           res.send('Login Unsuccessful, wrong username');
           }
          else {
           /// checking password
	   
           
	   //starts the user session
	   req.session.userId = req.body.username
           res.send('You are now loggedin, You user name is: '+ req.body.username + ' your password is: '+ req.body.password +' and your hashed password is: '+ hashedPassword
+ '<br />'+'<a href='+'./'+'>Home</a>');

          }   
          client.close();
	
          
        })
      });
});
})
//-------------------API----------------------------------
app.get('/api', function (req,res) {
     var MongoClient = require('mongodb').MongoClient;
     var url = 'mongodb://localhost';
     MongoClient.connect(url, function (err, client) {
     if (err) throw err                                                                                                                                                
     var db = client.db('recipebank');                                                                                                                                                                   
      db.collection('recipes').find().toArray((findErr, results) => {                                                                                                                                
      if (findErr) throw findErr;
      else
         res.json(results);                                                                                                                                             
      client.close();                                                                                                                                                   
  });
});
});

}

	






