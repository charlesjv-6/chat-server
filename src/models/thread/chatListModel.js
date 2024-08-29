const sequelize = require('../../../config/sequelize.js');
const { DataTypes } = require('sequelize');

const ChatList = sequelize.define('ChatList', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

module.exports = ChatList;