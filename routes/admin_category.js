
var express = require('express');
var router = express.Router();

var auth = require('../config/auth');
var isAdmin = auth.isAdmin;

var Category = require('../models/category');


router.get('/', isAdmin, function(req,res){
    Category.find(function(err, categories){
        if(err) return console.log(err);
        res.render('admin/categories',{categories: categories});
    });
});


   
// GET add_category  
router.get('/add_category', isAdmin, function(req,res){
    
    var title = "";
    
     res.render('admin/add_category', {
         title : title
     }); 

});


// POST add_category
router.post('/add_category', function(req,res){

    //req.checkBody('title', 'Title must have a value').noEmpty();

    var title = req.body.title;
    var slug = title;

    Category.findOne({title: title}, function(err, category){
        if (category) {
            req.flash('danger', 'Category already exists! Please choose another.');
            res.render('admin/add_category', {
                    title : title
                });
            }
        else if(title == ""){
            req.flash('danger', 'Please enter a valid category name!');
            res.render('admin/add_category', {
                    title : title
                });
        }
        else{
            var categoryValue = new Category({
                title: title,
                slug: slug
            });
            categoryValue.save(function(err){
                if (err)
                    return console.log(err);

                // Get transfer categories to local's of app.
                Category.find(function(err, categories){
                    if(err)
                        console.log(err);
                    else
                        req.app.locals.categories = categories;
                });

                req.flash('success', 'Category added!');
                res.redirect('/admin/categories');
            });
        }
        });
   
});

 
// GET edit_category
router.get('/edit_category/:slug', isAdmin, function(req,res){

    Category.findOne({slug:req.params.slug}, function(err,category){

        if(err)
            return console.log(err);
        
        res.render('admin/edit_category', {
            title: category.title, 
            id: category._id,
            slug: category.slug
        });
    });

});

// POST edit_category
router.post('/edit_category/:slug', function(req,res){


    var title = req.body.title;
    var slug = title;
    var id = req.body.id;

    Category.findOne({slug: slug, _id: {'$ne': id}}, function(err,category) {
        if(category){
            req.flash('danger', 'Category already exists!');
            res.render('admin/edit_category',{
                title:title,
                slug: slug,
                id: id
            });
        }
        else if(title == ""){
            req.flash('danger', 'Please enter a valid category name!');
            res.render('admin/add_category', {
                    title : title,
                    slug: slug,
                    id: id
                });
        }
        else{
            Category.findById(id, function(err,category){

                if(err)
                    return console.log('Error : '+err);
                
                category.title = title;
                category.slug = slug;

                category.save(function(err){
                    if (err)
                        return console.log(err);

                    // Get transfer categories to local's of app.
                    Category.find(function(err, categories){
                        if(err)
                            console.log(err);
                        else
                            req.app.locals.categories = categories;
                    });
        
                    req.flash('success', 'Category Edited!');
                    res.redirect('/admin/categories/edit_category/'+category.slug);
                });
                
            });
        }            
    });

});


// GET delete category
router.get('/delete_category/:id', isAdmin, function(req,res){
    
    Category.findByIdAndRemove(req.params.id, function(err){
        if(err)
            return console.log(err);
        
        // Get transfer categories to local's of app.
        Category.find(function(err, categories){
            if(err)
                console.log(err);
            else
                req.app.locals.categories = categories;
            
        });
        
        req.flash('success','Category deleted!');
        res.redirect('/admin/categories');

    });

});

 

module.exports = router;
