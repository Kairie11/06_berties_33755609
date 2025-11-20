const bcrypt = require('bcrypt');
const saltRounds = 10;

bcrypt.hash('smiths', saltRounds, function(err, hashedPassword) {
    if (err) {
        console.error(err);
    } else {
        console.log('Hashed password:', hashedPassword);
    }
});