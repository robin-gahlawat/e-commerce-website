
var express = require('express');
var router = express.Router();

var Page = require('../models/page');


//Exports
router.get('/', function(req,res){
    res.render('index', {
        title: '',
        content: 'no content available'
    });
});



// GET page
router.get('/:slug', function(req,res){
    
    var slug = req.params.slug;

    Page.findOne({slug: slug}, function(err, page){
        if(err)
            console.log(err);
        
        if(!page)
        res.render('index', {
            title: 'hello',
            content: 'no content available'
        });
        else{
            res.render('index', {
                title: page.title,
                content: page.content
            })
        }

    })

});


module.exports = router;
