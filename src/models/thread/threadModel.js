const sequelize = require('../../../config/sequelize.js');
const { DataTypes } = require('sequelize');
const User = require('../user/userModel.js');
const ChatList = require('./chatListModel.js');

const Thread = sequelize.define('Thread', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true
  },
  receiverId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  senderId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  chatId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: ChatList,
      key: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  content: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

module.exports = Thread;
