const bcrypt = require('bcrypt');
const User = require('../models/user/userModel');

const auth = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the user by email
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(401).json({ message: 'Invalid email or password' });

        // Check the password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

        // On successful authentication, create a session or token
        req.session.user = { 
            id: user.id, 
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName
        } 
        
        res.json({ 
            success: true,
            message: 'Authentication successful', 
            user: { 
                id: user.id, 
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName
            } 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Internal server error',
            error: error.toString()
        });
    }
}

module.exports = auth;