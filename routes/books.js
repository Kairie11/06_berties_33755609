// Create a new router
const express = require("express")
const router = express.Router()
const { check, validationResult } = require('express-validator');

const redirectLogin = (req, res, next) => {
    if (!req.session.userId ) {
      res.redirect('../users/login')
    } else {
        next ();
    }
}

router.get('/search',function(req, res, next){
    res.render("search.ejs")
});

router.get('/search-result',
    [
        check('search_text')
            .notEmpty()
            .withMessage('Search text cannot be empty')
            .trim()
            .isLength({ min: 1, max: 100 })
            .withMessage('Search text must be between 1 and 100 characters')
    ],
    function (req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.redirect('./search')
            return;
        }
        
        //searching in the database
        res.send("You searched for: " + req.query.search_text)
});

    router.get('/list', redirectLogin, function(req, res, next) {
        let sqlquery = "SELECT id, name FROM books"; // query database to get all the books
        // execute sql query
        db.query(sqlquery, (err, result) => {
            if (err) {
                next(err)
            }
            res.render("list.ejs", {availableBooks:result})
         });
    });

// Export the router object so index.js can access it
module.exports = router
