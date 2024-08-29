const bcrypt = require('bcrypt');

// sample middleware for hashing passswords
const hashPassword = async (req, res, next) => {
    try {
        if (req.body.password) {
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            req.body.password = hashedPassword;
        }
        next();
    } catch (error) {
        console.error('Error hashing password:', error);
        res.status(500).send('Error hashing password');
    }
};

module.exports = hashPassword;
