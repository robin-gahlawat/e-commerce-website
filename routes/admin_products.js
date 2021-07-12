
var express = require('express');
var router = express.Router();
var mkdirp = require('mkdirp');
var fs = require('fs-extra');
var resizeImg = require('resize-img');

var auth = require('../config/auth');
var isAdmin = auth.isAdmin;

var crypto = require("crypto");



var Product = require('../models/product');
var Category = require('../models/category');
const { exists } = require('../models/product');



router.get('/', isAdmin, function(req,res){

    /* This is producing error, because count is not working properly.
   var count;
    Product.estimatedDocumentCount(function(err, c){
        count = c;
    });
    */

    Product.find(function(err, products){
        res.render('admin/products',{
            products: products
        });
    });

});


   
// GET add_product
router.get('/add_product', isAdmin, function(req,res){
    
    var title = "";
    var desc = "";
    var price = "";

    Category.find(function(err, categories){
        res.render('admin/add_product', {
            title : title,
            desc: desc,
            price: price,
            categories: categories
        }); 
    });
    
});


// POST add_product
router.post('/add_product', function(req,res){

    if(!req.files)
        imageFile =""; 
    else if(req.files)
        var imageFile = typeof(req.files.image) !== "undefined" ? req.files.image.name : "";


    var title = req.body.title;
    var slug = title;
    var desc  = req.body.desc;
    var price = req.body.price;
    var category = req.body.category;

 


    if(title == "" || desc == "" || price == ""){
        req.flash('danger', 'Please enter valid Values!');
        var title = "";
        var desc = "";
        var price = "";
        Category.find(function(err, categories){
            res.render('admin/add_product', {
                title : title,
                desc: desc,
                price: price,
                categories: categories
            }); 
        }); 
    }
    
    var i =0;
    var status = true;
    for(i=0; i<price.length; ++i){
        var st = parseInt(price[i]);
        if(! (st >=0 && st<=9) ){
            console.log(price[i]);
            status = false;
        }
    }
    if(!status){
        req.flash('danger', 'Price must be an Integer!');
        var title = "";
        var desc = "";
        var price = "";
        Category.find(function(err, categories){
            res.render('admin/add_product', {
                title : title,
                desc: desc,
                price: price,
                categories: categories
            }); 
        }); 
    }


    Product.findOne({slug: slug}, function(err, product){
        if (product) {
            req.flash('danger', 'Product already exists! Please choose another.');
            Category.find(function(err, categories){
                res.render('admin/add_product', {
                    title : title,
                    desc: desc,
                    price: price,
                    categories: categories
                }); 
            });
        }
        else{

            var price2 = parseFloat(price).toFixed(2);


            var productDetails = new Product({
                title: title,
                slug: slug,
                desc: desc,
                price: price2,
                category: category,
                image: imageFile
            }); 

            productDetails.save(function(err){
                if (err)
                    return console.log("Product error1 : " + err);

                console.log("reached at 1  <==============>");

                mkdirp('public/product_images/'+productDetails._id, function(err){
                    return console.log("Product error2 : " + err);
                });
                mkdirp('public/product_images/'+productDetails._id +'/gallery', function(err){
                    return console.log("Product error3 : " + err);
                });
                mkdirp('public/product_images/'+productDetails._id+'/gallery/thumbs', function(err){
                    return console.log("Product error4 : " + err);
                });

                console.log("reached at 2   <==============>");


                if (imageFile != ""){
                    var productImage = req.files.image;
                    var path = 'public/product_images/' + productDetails._id + '/' + imageFile;

                    productImage.mv(path,function(err){
                        return console.log("Product error5 : " + err);
                    });
                }

                req.flash('success', 'Product added!');
                res.redirect('/admin/products');
            });
        }
        });
   
});

 
// GET edit_product
router.get('/edit_product/:id', isAdmin, function(req,res){



    Category.find(function(err, categories){

        Product.findById(req.params.id, function(err, p){
            if(err){
                console.log("edit_product error1 : " + err);
                res.redirect('/admin/products');
            }
            else{
                var galleryDir = 'public/product_images/' + p.id + '/gallery';
                var galleryImages = null;
                fs.readdir(galleryDir, function(err, files){
                    if(err){
                        console.log("edit_product error2 : " + err);
                    }
                    else{
                        galleryImages = files;
                        res.render('admin/edit_product',{
                            id: p._id,
                            title: p.title,
                            desc: p.desc,
                            categories: categories,
                            category: p.category,
                            price: p.price,
                            image: p.image,
                            galleryImages: galleryImages
                        });
                    }
                });
            }
        });
    });

});

// POST edit_product
router.post('/edit_product/:id', function(req,res){

    if(!req.files)
        var imageFile =""; 
    else if(req.files)
        var imageFile = typeof(req.files.image) !== "undefined" ? req.files.image.name : "";

    var title = req.body.title;
    var slug = title;
    var desc  = req.body.desc;
    var price = req.body.price;
    var category = req.body.category;

    var pimage = req.body.pimage;
    var id = req.params.id;


    Product.findOne({slug: slug, _id:{'$ne':id}}, function(err, p){
        if(err)
            console.log(err);

        if(p){
            req.flash('danger', "Choose another");
            res.redirect('/admin/products/edit_product/:'+id);
        }
        else {

            Product.findById(id, function(err, p){
                if(err)
                    console.log(err);

                p.title = title;
                p.slug = slug;
                p.desc = desc;
                p.price = parseFloat(price).toFixed(2);
                p.category = category;

                if(imageFile!= ""){
                    p.image = imageFile;
                }

                p.save(function(err){
                    if(err)
                        console.log(err);

                    if(imageFile != ""){
                        if(pimage != ""){
                            fs.remove('public/product_images/'+id+'/'+pimage, function(err){
                                if(err)
                                    console.log("removing error1"+err);
                            });
                        }
                        
                        var productImage = req.files.image;
                        var path = 'public/product_images/' + id + '/' + imageFile;
                        productImage.mv(path,function(err){
                            return console.log("Product error5 : " + err);
                        });
                    }
                    req.flash('success', 'Product edited!');
                    res.redirect('/admin/products/edit_product/'+ id);
                });

            });

        }
        
    });

   

});


// POST product_gallery
router.post('/product_gallery/:id', function(req,res){

    var productImage = req.files.file;
    var id = req.params.id;
    var path = 'public/product_images/' + id + '/gallery/' + req.files.file.name;
    var thumbsPath = 'public/product_images/' + id + '/gallery/thumbs/' + req.files.file.name;

    productImage.mv(path, function(err){
        if (err) console.log(err);

        // creating thubnails, storing them in folder.
        resizeImg(fs.readFileSync(path), {width:100, height: 100}).then(function(buf){
            fs.writeFileSync(thumbsPath, buf);
        });

    });

    res.sendStatus(200);

});


// GET delete_image
router.get('/delete_image/:image', isAdmin, function(req,res){
    
    var imagePath = 'public/product_images/' + req.query.id + '/gallery/' + req.params.image;
    var thumbsPath = 'public/product_images/' + req.query.id + '/gallery/thumbs/' + req.params.image;

    fs.remove(imagePath, function(err){
        if(err) console.log("can't remove image"+err);
        else{
            fs.remove(thumbsPath,function(err){
                if(err) console.log("can't remove image"+err);
                else{
                    req.flash('success','Image deleted!');
                    res.redirect('/admin/products/edit_product/'+req.query.id);
                }
            });
        }
    });

});


// GET delete product
router.get('/delete_product/:id', isAdmin, function(req,res){
    
    var id = req.params.id;
    var path = 'public/product_images/' + id;

    fs.remove(path, function(err){
        if(err) console.log(err);
        else{
            Product.findByIdAndRemove(id, function(err){
                if(err) console.log(err);
            });

            req.flash('success','Product deleted!');
            res.redirect('/admin/products/');
    
        }
    });


});

 

module.exports = router;
