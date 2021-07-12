
var express = require('express');
var router = express.Router();

var Product = require('../models/product');
var Category = require('../models/category');
var fs = require('fs-extra');



// GET all_products
router.get('/', function(req,res){
   
    Product.find(function(err, products){
        if(err)
            console.log(err);
        
        res.render('all_products',{
            title: 'All Products',
            products: products
        });
    });

});



// GET products by category
router.get('/:category_slug', function(req,res){

    var categorySlug = req.params.category_slug;

    Category.find({slug: categorySlug}, function(err, c){
        Product.find({category: categorySlug}, function(err, products){
            if(err)
                console.log(err);
            
            res.render('cat_products',{
                title: c.title,
                products: products
            });
        });
    });
 
});


// GET product detils
router.get('/:category_slug/:p_id', function(req,res){

    var  galleryImages = null;
    var id = req.params.p_id;

    var loggedIn = (req.isAuthenticated()) ? true: false;

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
                        galleryImages: galleryImages,
                        loggedIn: loggedIn
                    });
                }
            });
        }

    });
 
});








module.exports = router;
