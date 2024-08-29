const sequelize = require('../../../config/sequelize.js');
const bcrypt = require('bcrypt');
const { DataTypes } = require('sequelize');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

// Hash password before creating a new user
User.beforeCreate(async (user, options) => {
  // Check for duplicate email
  const existingUser = await User.findOne({ where: { email: user.email } });
  if (existingUser) {
    throw new Error('Email already in use');
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
});

// Hash password before updating an existing user
User.beforeUpdate(async (user, options) => {
  if (user.changed('email')) {
    // Check for duplicate email
    const existingUser = await User.findOne({ where: { email: user.email } });
    if (existingUser && existingUser.id !== user.id) {
      throw new Error('Email already in use');
    }
  }

  if (user.changed('password')) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});


module.exports = User;