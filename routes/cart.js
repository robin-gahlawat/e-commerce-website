
var express = require('express');
var router = express.Router();

var Product = require('../models/product');
var fs = require('fs-extra');


// GET checkout
router.get('/checkout',function(req,res){

    res.render('checkout', {
        title: 'Checkout',
        cart: req.session.cart
    });
    
});

//POST add btn product to cart
router.post('/addbtn/:p_id', function(req,res){

    var id = req.params.p_id;
    var quant = req.body.qty;
    
    var status = 1;

    if(quant == ""){
        status = 0;
        console.log("err101");
        req.flash('danger','Enter a valid value!');
        Product.findOne({_id : id}, function(err, product){

            if(err) console.log(err);
            else{
                var galleryDir = 'public/product_images/' + product._id + '/gallery';
                fs.readdir(galleryDir, function(err, files){
                    if(err) console.log(err);
                    else{
                        galleryImages = files;
                        res.render('view_product', {
                            title: product.title,
                            p: product,
                            galleryImages: galleryImages
                        });
                    }
                });
            }
    
        });        
    }

    if(status){
        
        Product.findOne({_id: id}, function(err, p){

            if(err) console.log("er1: "+err);

            if(typeof req.session.cart == "undefined"){
                req.session.cart = [];
                req.session.cart.push({
                    title: p.title,
                    id: p._id,
                    category: p.category,
                    qty: quant,
                    price: parseFloat(p.price).toFixed(2),
                    image: '/product_images/' + p._id + '/' + p.image
                });
            }
            else{
                var cart = req.session.cart;
                var newItem = true;
                for(var i=0;i<cart.length; i++){
                    if(cart[i].id == id){
                        while(quant-->0)
                            cart[i].qty++;
                        newItem = false;
                        break;
                    }
                }
                if(newItem){
                    cart.push({
                        title: p.title,
                        id: p._id,
                        category: p.category,
                        qty: quant,
                        price: parseFloat(p.price).toFixed(2),
                        image: '/product_images/' + p._id + '/' + p.image
                    });
                }
            }

            req.flash('success','Product added!');
            res.redirect('back');

        });
    
    }

});


// GET update checkout product
router.get('/update/:p_id',function(req,res){

    var id = req.params.p_id;
    var cart = req.session.cart;
    var action = req.query.action;

    for(var i = 0; i< cart.length; i++){
        if(cart[i].id == id){
            switch(action){
                case "add":
                    cart[i].qty++;
                    break;
                case "remove":
                    cart[i].qty--;
                    if(cart[i].qty < 1){
                        cart.splice(i, 1);
                        if(cart.length==0)
                            delete req.session.cart;
                    }
                    break;
                case "clear":
                    cart.splice(i, 1);
                    if(cart.length == 0) delete req.session.cart;
                    break;
                default:
                    console.log('updating problem');
            break;
            }
        }
    }

    res.redirect('/cart/checkout');

});


// GET clear cart
router.get('/clear',function(req,res){

    delete req.session.cart;

    req.flash('success', 'Cart cleared');
    res.redirect('/cart/checkout');

    
});


// GET buy
router.get('/buy',function(req,res){


    req.flash('success', 'Transaction Completed!');
    res.render('index', {
        title: 'Order Successfully Placed!',
        content: ''
    });

    
});


module.exports = router;
