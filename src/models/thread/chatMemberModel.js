const sequelize = require('../../../config/sequelize.js');
const { DataTypes } = require('sequelize');
const User = require('../user/userModel.js');
const ChatList = require('./chatListModel.js');

const ChatMember = sequelize.define('ChatMember', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  chatId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: ChatList,
      key: 'id'
    }
  }
});

module.exports = ChatMember;