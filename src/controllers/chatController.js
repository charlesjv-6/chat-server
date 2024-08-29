const ChatList = require('../models/thread/chatListModel.js');
const ChatMember = require('../models/thread/chatMemberModel.js');
const Thread = require('../models/thread/threadModel.js');
const User = require('../models/user/userModel.js');

const getChats = async (req, res) => {
  const userId = req.body.id;

  try {
    const chats = await ChatList.findAll({
      include: [
        {
          model: ChatMember,
          where: { userId }
        }
      ]
    });

    const getUserDetails = async (userId) => {
      try {
          const user = await User.findByPk(userId);
          return {
              firstName: user.firstName,
              lastName: user.lastName
          };
      } catch (error) {
          console.error('Failed to get user details:', error);
          return { firstName: '', lastName: '' };
      }
    };
  
    const chatDetails = await Promise.all(chats.map(async (chat) => {
      const messages = await Thread.findAll({
          where: { chatId: chat.id },
          order: [['createdAt', 'DESC']],
          limit: 1
      });
  
      const messagesWithDetails = await Promise.all(messages.map(async (message) => {
        const senderDetails = await getUserDetails(message.senderId);
        const receiverDetails = await getUserDetails(message.receiverId);

        const messageJson = message.toJSON();
        return {
            ...messageJson,
            sender: {
              id: messageJson.senderId,
              firstName: senderDetails.firstName,
              lastName: senderDetails.lastName
            },
            receiver: {
              id: messageJson.receiverId,
              firstName: receiverDetails.firstName,
              lastName: receiverDetails.lastName
            },
            // Remove senderId and receiverId from the final object
            senderId: undefined,
            receiverId: undefined,
            userId: undefined
        };
      }));
  
      return {
          ...chat.toJSON(),
          messages: messagesWithDetails
      };
    }));

    res.status(200).send({
      success: true,
      data: chatDetails
    });
  } catch (error) {
    console.error('Failed to retrieve chat list:', error);
    res.status(500).send({
      success: false,
      message: 'Failed to retrieve chat list'
    });
  }
};

const getChatMembers = async (req, res) => {
    const { chatId } = req.params;
    try {
      const chatMembers = await ChatMember.findAll({
        where: { chatId }
      });
      res.status(200).send({
        success: true,
        members: chatMembers
      });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: 'Failed to retrieve chat members'
        });
    }
};

const getMessagesByChatId = async (req, res) => {
    const { chatId } = req.params;
    try {
      const threads = await Thread.findAll({
        where: { chatId }
      });
      res.status(200).send({
        success: true,
        messages: threads
      });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: 'Failed to retrieve data'
        });
    }
};

const createThread = async (req, res) => {
    const { senderId, receiverId, chatId, content, type } = req.body;
  
    try {
      // Check if the chat exists, or create it
      let chat = await ChatList.findByPk(chatId);
      if (!chat) {
        chat = await ChatList.create({ name: "New Chat"});
      }
  
      await Thread.create({
        senderId,
        receiverId,
        chatId: chat.id,
        content,
        type
      });
  
      if(chat.id) {
        await ChatMember.findOrCreate({
          where: { userId: senderId, chatId: chat.id }
        });
        await ChatMember.findOrCreate({
          where: { userId: receiverId, chatId: chat.id }
        });
      }
  
      res.status(201).send({
        success: true,
        message: "Thread Created"
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create thread' });
    }
};

const sendChat = async (req, res)=> {
  const { senderId, receiverId, chatId, content } = req.body;
  try {
    let chat = await ChatList.findByPk(chatId);
    if(chat) {
      await Thread.create({
        senderId,
        receiverId,
        chatId: chat.id,
        content
      });
    }
    res.status(201).send({
      success: true,
      message: "Sent"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Sending Failed' });
  }
}

module.exports = { getChats, getChatMembers, getMessagesByChatId, createThread, sendChat };