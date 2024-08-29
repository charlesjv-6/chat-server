require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const sequelize = require('./config/sequelize.js');

// Routers
const router = require('./src/routes/router.js');
const userRouter = require('./src/routes/user/userRouter.js');
const threadRouter = require('./src/routes/thread/threadRouter.js');
const authRouter = require('./src/routes/auth.js');

// Models
const User = require('./src/models/user/userModel.js');
const ChatList = require('./src/models/thread/chatListModel.js');
const ChatMember = require('./src/models/thread/chatMemberModel.js');
const Thread = require('./src/models/thread/threadModel.js');

// Establish associations
User.hasMany(ChatMember, { foreignKey: 'userId' });
ChatMember.belongsTo(User, { foreignKey: 'userId' });

ChatList.hasMany(ChatMember, { foreignKey: 'chatId' });
ChatMember.belongsTo(ChatList, { foreignKey: 'chatId' });

User.hasMany(Thread, { foreignKey: 'userId' });
Thread.belongsTo(User, { foreignKey: 'userId' });

ChatList.hasMany(Thread, { foreignKey: 'chatId' });
Thread.belongsTo(ChatList, { foreignKey: 'chatId' });

// Sync models
sequelize.sync({ alter: true });

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

app.use(session({
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: null
  },
}));

// Mount the route handlers
app.use('/', router);
app.use('/t', threadRouter);
app.use('/user', userRouter);
app.use('/auth', authRouter);

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ server });
const messages = []; // In-memory store for messages
const clients = {}; // To keep track of connected clients

wss.on('connection', async (ws) => {
  const clientId = uuidv4();
  clients[clientId] = ws;

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);

      if (data.type === 'logged-in'){
        ws.userId = data.userId;
        const userId = ws.userId;
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
      
          ws.send(JSON.stringify({ type: 'chatList', data: chatDetails }));
        } catch (error) {
          console.error('Failed to fetch chat list:', error);
        }
      }

      if (data.type === 'join') {
        ws.chatId = data.chatId;
        console.log(`Client ${clientId} joined chat ${ws.chatId}`);

        // Fetch messages from database
        await Thread.findAll({ where: { chatId: ws.chatId } })
          .then(threads => {
            const chatMessages = threads.map(thread => ({
              id: thread.id,
              chatId: thread.chatId,
              senderId: thread.senderId,
              receiverId: thread.receiverId,
              content: thread.content,
              createdAt: thread.createdAt,
            }));

            ws.send(JSON.stringify({ type: 'chatHistory', messages: chatMessages }));
          })
          .catch(err => {
            console.error('Failed to fetch chat history:', err);
          });
      }

      if (data.type === 'newMessage') {
        try {
          const newMessage = await Thread.create({
            chatId: data.chatId,
            senderId: data.senderId,
            receiverId: data.receiverId,
            content: data.content
          });

          // Add the new message to the in-memory store
          messages.push(newMessage);

          // Broadcast the new message to all clients in the chat
          broadcastMessage(ws.chatId, {
            type: 'newMessage',
            message: newMessage
          });
        } catch (error) {
          console.error('Error saving message to database:', error);
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  ws.on('close', () => {
    console.log(`Client ${clientId} disconnected`);
    delete clients[clientId];
  });
});

const broadcastMessage = (chatId, message) => {
  Object.values(clients).forEach(client => {
    if (client.chatId === chatId) {
      client.send(JSON.stringify(message));
    }
  });
};

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
