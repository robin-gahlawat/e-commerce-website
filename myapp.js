
/*
   mongodb+srv://testdb:<password>@cluster0.uxyzv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority

   mongodb+srv://testdb:testdb123@cluster0.uxyzv.mongodb.net/shopperDb?retryWrites=true&w=majority

*/


var express = require('express');
var path = require('path');
const mongoose = require('mongoose')
var bodyParser = require('body-parser')
var session = require('express-session')
//var expressValidate = require('express-validate');
var  fileUpload = require('express-fileupload');
var passport = require('passport');


// connect to db 
mongoose.connect(' mongodb+srv://testdb:testdb123@cluster0.uxyzv.mongodb.net/shopperDb?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log('Connected to database.')
});

// Init app
var app = express();

// View engine setup 
// use this line only if u want to change default name(views) of your folder containing ejs files
app.set('views', path.join(__dirname, 'views'));   
app.set('view engine', 'ejs');

// set public folder
app.use(express.static(path.join(__dirname,'public')));


// Get Page Model to header.ejs
var Page = require('./models/page');
Page.find({}).sort({sorting: 1}).exec(function(err, pages){
  if(err)
    console.log(err);
    else{
      // It allows us to access pages in header file.
      app.locals.pages = pages;
    }
});

// Get Category Model to header.ejs
var Category = require('./models/category');
Category.find(function(err, categories){
  if(err)
    console.log(err);
  else{
      // It allows us to access pages in header file.
      app.locals.categories = categories;
    }
});





// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Express fileUpload middleware
app.use(fileUpload());

// Express sesssion middleware (used by flash messages)
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
    //cookie: { secure: true }
  }))


  // Express messages middleware
  app.use(require('connect-flash')());
  app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
  });
  
 


  // Passport Config
require('./config/passport')(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req, res, next){
  res.locals.cart = req.session.cart;
  res.locals.user = req.user || null;
  next();
});


//Set routes
var adminPages = require('./routes/admin_pages.js');
var adminCategories = require('./routes/admin_category');
var adminProducts = require('./routes/admin_products');
var pages = require('./routes/pages.js');
var products = require('./routes/products.js');
var cart = require('./routes/cart.js');
var users = require('./routes/users.js');
var start = require('./routes/start.js');
//const user = require('./models/user');

app.use('/', start);
app.use('/pages',pages);
app.use('/products', products);
app.use('/cart', cart);
app.use('/users', users);
app.use('/admin/pages', adminPages);
app.use('/admin/categories', adminCategories);
app.use('/admin/products', adminProducts);


// start the server

var port = process.env.PORT || 3000;
app.listen(port, function(){ 
    console.log('Server started on port '+port);
});

