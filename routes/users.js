// Create a new router
const express = require("express")
const router = express.Router()
const bcrypt = require('bcrypt')
const saltRounds = 10

router.get('/register', function (req, res, next) {
    res.render('register.ejs')
})

router.post('/registered', function (req, res, next) {
    const plainPassword = req.body.password
    
    bcrypt.hash(plainPassword, saltRounds, function(err, hashedPassword) {
        if (err) {
            return next(err)
        }
        
        // Store hashed password in database
        const sqlQuery = "INSERT INTO users (username, first_name, last_name, email, hashedPassword) VALUES (?, ?, ?, ?, ?)";
        const values = [req.body.username, req.body.first, req.body.last, req.body.email, hashedPassword];
        
        db.query(sqlQuery, values, (err, dbResult) => {
            if (err) {
                return next(err);
            }
            
            let result = 'Hello '+ req.body.first + ' '+ req.body.last +' you are now registered!  We will send an email to you at ' + req.body.email;
            result += 'Your password is: '+ req.body.password +' and your hashed password is: '+ hashedPassword;
            res.send(result);
        });
    })
});

router.get('/list', function(req, res, next) {
    let sqlquery = "SELECT id, username, first_name, last_name, email FROM users";
    
    db.query(sqlquery, (err, result) => {
        if (err) {
            return next(err);
        }
        res.render("userlist.ejs", {users: result});
    });
});

router.get('/login', function (req, res, next) {
    res.render('login.ejs')
})

router.post('/loggedin', function (req, res, next) {
    const username = req.body.username;
    
    // Select the hashed password for the user from the database
    const sqlQuery = "SELECT hashedPassword FROM users WHERE username = ?";
    
    db.query(sqlQuery, [username], (err, result) => {
        if (err) {
            return next(err);
        }
        
        // Check if user exists
        if (result.length === 0) {
            res.send('Login failed: Username or password is incorrect');
            return;
        }
        
        // Get the hashed password from database
        const hashedPassword = result[0].hashedPassword;
        
        // Compare the password supplied with the password in the database
        bcrypt.compare(req.body.password, hashedPassword, function(err, result) {
            if (err) {
                // Handle error
                return next(err);
            }
            else if (result == true) {
                // Send success message
                res.send('Login successful! Welcome back, ' + username);
            }
            else {
                // Send failure message
                res.send('Login failed: Username or password is incorrect');
            }
        })
    });
});

// Export the router object so index.js can access it
module.exports = router