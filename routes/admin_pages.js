
var express = require('express');
var router = express.Router();
var crypto = require("crypto");

var auth = require('../config/auth');
var isAdmin = auth.isAdmin;

var Page = require('../models/page');
const { validate } = require('../models/page');



// GET pages

router.get('/', isAdmin, function(req,res){

    Page.find({}).sort({sorting: 1}).exec(function(err, pages){
        res.render('admin/pages',{
            pages:pages
        });
    });
});
   
// GET add_page  

router.get('/add_page', isAdmin, function(req,res){
    
    var title = "";
    var slug = "";
    var content = "";
     res.render('admin/add_page', {
         title : title,
         slug: slug,
         content: content
     }); 

});

// POST add_page

router.post('/add_page', function(req,res){

    //req.checkBody('title', 'Title must have a value').noEmpty();
    //req.checkBody('title', 'Content must have a value').noEmpty();

    var title = req.body.title;
    var slug = req.body.slug;
    var content = req.body.content;


    if(content == "" || title == ""){
        req.flash('danger', 'Please enter valid Values!');
        var title = "";
        var slug = "";
        var content = "";
        res.render('admin/add_page', {
            title : title,
            slug: slug,
            content: content
        }); 
    }   

    if (slug == ""){
        var randomString = crypto.randomBytes(5).toString('hex');
        slug = randomString;
    }
   

    Page.findOne({slug: slug}, function(err, page){
        if (page) {
            req.flash('danger', 'Page slug exists, choose another.');
            res.render('admin/add_page', {
                    title : title,
                    slug: slug,
                    content: content
                });
            }
            else{
                var page = new Page({
                    title: title,
                    slug: slug,
                    content: content,
                    sorting: 0
                });
                page.save(function(err){
                    if (err)
                        return console.log(err);

                    req.flash('success', 'Page added!');
                    res.redirect('/admin/pages');
                });
            }
        });
         
 
   
});

 
// GET edit_page

router.get('/edit_page/:slug', isAdmin, function(req,res){

    Page.findOne({slug:req.params.slug}, function(err,page){

        if(err)
            return console.log(err);
        
        res.render('admin/edit_page', {
            title: page.title, 
            slug: page.slug,
            content: page.content,
            id: page._id
        });
    });


});

// POST edit_page

router.post('/edit_page/:slug', function(req,res){


    var title = req.body.title;
    var slug = req.body.slug;
    var content = req.body.content;
    var id = req.body.id;

    if(content == "" || title == ""){
        req.flash('danger', 'Please enter valid Values!');
        var title = "";
        var slug = "";
        var content = "";
        res.render('admin/add_page', {
            title : title,
            slug: slug,
            content: content
        }); 
    }   

    if (slug == ""){
        var randomString = crypto.randomBytes(5).toString('hex');
        slug = randomString;
    }


    Page.findOne({slug: slug, _id: {'$ne': id}}, function(err,page) {
        if(page){
            req.flash('danger', 'Page slug already exists');
            res.render('admin/edit_page',{
                title:title,
                slug: slug,
                content: content,
                id: id
            });
        }
        else{

            Page.findById(id, function(err,page){

                if(err)
                    return console.log('Error : '+err);
                
                page.title = title;
                page.slug = slug;
                page.content = content;

                page.save(function(err){
                    if (err)
                        return console.log(err);
        
                    req.flash('success', 'Page Edited!');
                    res.redirect('/admin/pages/edit_page/'+page.slug);
                });
                
            });

        }

    });

         
   
});

// GET delete page

router.get('/delete_page/:id', isAdmin, function(req,res){
    
    Page.findByIdAndRemove(req.params.id, function(err){

        if(err)
            return console.log(err);
        
        req.flash('success','Page deleted!');
        res.redirect('/admin/pages');

    });

});

 


module.exports = router;
