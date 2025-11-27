// Create a new router
const express = require("express")
const router = express.Router()
const bcrypt = require('bcrypt')
const saltRounds = 10
const { check, validationResult } = require('express-validator');

const redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
        res.redirect('/users/login');
    } else {
        next();
    }
};

router.get('/register', function (req, res, next) {
    res.render('register.ejs')
})

router.post('/registered',
    [
        check('email').isEmail().withMessage('Please enter a valid email address'),
        check('username')
            .isLength({ min: 5, max: 20 })
            .withMessage('Username must be between 5 and 20 characters')
            .isAlphanumeric()
            .withMessage('Username must contain only letters and numbers'),
        check('password')
            .isLength({ min: 5 })
            .withMessage('Password must be at least 5 characters long')
            .matches(/^[\w!@#$%^&*(),.?":{}|<>-]+$/)
            .withMessage('Password contains invalid characters'),
        check('first')
            .notEmpty()
            .withMessage('First name is required')
            .isAlpha()
            .withMessage('First name must contain only letters'),
        check('last')
            .notEmpty()
            .withMessage('Last name is required')
            .isAlpha()
            .withMessage('Last name must contain only letters')
    ],
    function (req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.render('./register', { errors: errors.array() })
        }
        else {
            const plainPassword = req.body.password
            
            bcrypt.hash(plainPassword, saltRounds, function(err, hashedPassword) {
                if (err) {
                    return next(err)
                }
                
                // Store hashed password in database - SANITIZE ALL INPUTS
                const sqlQuery = "INSERT INTO users (username, first_name, last_name, email, hashedPassword) VALUES (?, ?, ?, ?, ?)";
                const values = [
                    req.sanitize(req.body.username), 
                    req.sanitize(req.body.first),      // SANITIZE FIRST NAME
                    req.sanitize(req.body.last), 
                    req.sanitize(req.body.email), 
                    hashedPassword
                ];
                
                db.query(sqlQuery, values, (err, dbResult) => {
                    if (err) {
                        return next(err);
                    }
                    
                    let result = 'Hello '+ req.sanitize(req.body.first) + ' '+ req.sanitize(req.body.last) +' you are now registered!  We will send an email to you at ' + req.sanitize(req.body.email);
                    result += 'Your password is: '+ req.body.password +' and your hashed password is: '+ hashedPassword;
                    res.send(result);
                });
            })
        }
});

router.get('/list', redirectLogin, function(req, res, next) {
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

router.post('/loggedin',
    [
        check('username').notEmpty().withMessage('Username is required'),
        check('password').notEmpty().withMessage('Password is required')
    ],
    function (req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.render('./login')
            return;
        }
        
        const username = req.body.username;
        
        // Select user details including hashed password
        const sqlQuery = "SELECT id, username, first_name, hashedPassword FROM users WHERE username = ?";
        
        db.query(sqlQuery, [username], (err, result) => {
            if (err) {
                return next(err);
            }
            
            if (result.length === 0) {
                res.send('Login failed: Username or password is incorrect');
                return;
            }
            
            const hashedPassword = result[0].hashedPassword;
            
            bcrypt.compare(req.body.password, hashedPassword, function(err, comparison) {
                if (err) {
                    return next(err);
                }
                else if (comparison == true) {
                    // Save user session
                    req.session.userId = result[0].id;
                    req.session.username = result[0].username;
                    
                    res.send('Login successful! Welcome back, ' + username);
                }
                else {
                    res.send('Login failed: Username or password is incorrect');
                }
            })
        });
});

router.get('/logout', redirectLogin, (req,res) => {
    req.session.destroy(err => {
    if (err) {
      return res.redirect('./')
    }
    res.send('you are now logged out. <a href='+'./'+'>Home</a>');
    })
})

router.get('/profile', redirectLogin, function(req, res, next) {
    res.send('Welcome to your profile, ' + req.session.username);
});

// Export the router object so index.js can access it
module.exports = router