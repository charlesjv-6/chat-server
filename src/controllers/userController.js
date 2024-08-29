const User = require('../models/user/userModel'); 

const createUser = async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    try {
        // Create a new user using the User model
        const newUser = await User.create({
            firstName,
            lastName,
            email,
            password
        });

        res.send({
          success: true,
          message: 'User created successfully',
          user: {
            id: newUser.id,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            email: newUser.email
          }
        });
    } catch (error) {
        res.status(500).send({
          success: false,
          message: 'Unable to create user',
          error: error.toString()
        });
    }
}

const updateUser = async (req, res) => {
    // Assuming req.body contains user data sent in the request
    const { id, firstName, lastName, email, password } = req.body;

    try {
        // Find the user by ID
        const user = await User.findByPk(id);

        // Update user details
        if (user) {
            await user.update({
                firstName,
                lastName,
                email,
                password
            });
            res.send({
              success: true,
              message: 'User updated successfully'
            });
        } else {
            res.status(404).send({
              success: false,
              message: 'User not found'
            });
        }
    } catch (error) {
        res.status(500).send({
            success: false,
            message: 'Unable to update user',
            error: error.toString()
        });
    }
}

const getUser = async (req, res) => {
    const userId = req.params.id;

    try {
        // Find the user by id
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found' 
            });
        }

        res.json({ 
            success: true,
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
};

const getSessionUser = async (req, res) => {
    if (req.session.user) {
        res.status(200).send({ user: req.session.user });
    } else {
        res.status(401).send({ error: 'No active session' });
    }
};

module.exports = {
    getUser,
    createUser,
    updateUser,
    getSessionUser
}