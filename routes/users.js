
var express = require('express');
var router = express.Router();
var passport = require('passport');
var bcrypt = require('bcryptjs');

var User = require('../models/user');


// GET signup
router.get('/signup', function (req, res) {
    res.render('signup', {
        title: 'Sign Up'
    });
});


// POST signup 
router.post('/signup', function (req, res) {

    var name = req.body.name;
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;

    if (password != password2) {
        req.flash('danger', "Passwords does not match! Please re-enter details");
        res.redirect('/users/signup');
    }
    else if (name == "" || username == "" || password == "" || password2 == "") {
        req.flash('danger', "Please re-enter valid details");
        res.redirect('/users/signup');
    }

    else {
        User.findOne({ username: username }, function (err, user) {
            if (err) console.log(err);

            if (user) {
                req.flash('danger', "Username already exists, Please choose another one");
                res.redirect('/users/signup');
            }
            else {
                var user = new User({
                    name: name,
                    username: username,
                    password: password,
                    admin: 0
                });

                bcrypt.genSalt(10, function (err, salt) {
                    bcrypt.hash(user.password, salt, function (err, hash) {
                        if (err) console.log(err);
                        user.password = hash;

                        user.save(function (err) {
                            if (err)
                                console.log(err);
                            else {
                                req.flash('success', 'You are now registered!');
                                res.redirect('/users/login');
                            }
                        });
                    });
                });
            }
        });

    }


});


// GET login
router.get('/login', function (req, res) {

    if (res.locals.user) {
        res.redirect('/products');
    }
    else {
        res.render('login', {
            title: 'Log In'
        });
    }

});


// POST login
router.post('/login', function (req, res, next) {

    passport.authenticate('local', {
        successRedirect: '/products',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);

});


// GET logout
router.get('/logout', function (req, res) {

    delete req.session.cart;
    req.logout();


    req.flash('success', 'You are logged out!');
    res.redirect('/users/login');

});



module.exports = router;
