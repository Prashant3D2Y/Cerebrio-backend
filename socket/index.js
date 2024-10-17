// Import necessary modules
const express = require('express');
const { Server } = require('socket.io');
const http = require('http');
const getUserDetailsFromToken = require('../helpers/getUserDetailsFromToken'); // Your token decoding function
const UserModel = require('../models/UserModel'); // User model
const { ConversationModel, MessageModel } = require('../models/ConversationModel'); // Conversation and Message models
require('dotenv').config();

// Create an Express application
const app = express();
app.use(express.json()); // Middleware to parse JSON requests

// Set up a Socket.IO server with CORS settings
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL, // Replace with your frontend URL
        credentials: true,
    },
});

// Online user set to track connected users
const onlineUser = new Set();

io.on('connection', async (socket) => {
    console.log("Connected User", socket.id);

    const token = socket.handshake.auth.token;
    const user = await getUserDetailsFromToken(token);

    if (!user || !user._id) {
        console.log('Invalid user or missing user ID.');
        socket.disconnect();
        return;
    }

    socket.join(user._id.toString());
    onlineUser.add(user._id.toString());
    io.emit('onlineUser', Array.from(onlineUser));

    // Event for loading messages when a user connects
    socket.on('loadMessages', async (conversationId) => {
        try {
            const messages = await MessageModel.find({ conversationId })
                .populate('msgByUserId', 'username') // Populate user details if needed
                .exec();
            socket.emit('messages', messages);
        } catch (error) {
            console.error('Error loading messages:', error);
            socket.emit('error', { message: 'Could not load messages' });
        }
    });

    // Event for receiving a new message
    socket.on('new message', async (data) => {
        try {
            // Check if a conversation exists between sender and receiver
            let conversation = await ConversationModel.findOne({
                "$or": [
                    { sender: data.sender, receiver: data.receiver },
                    { sender: data.receiver, receiver: data.sender },
                ]
            });

            // If no conversation exists, create a new one
            if (!conversation) {
                conversation = await ConversationModel.create({
                    sender: data.sender,
                    receiver: data.receiver,
                });
            }

            // Create a new message
            const message = new MessageModel({
                text: data.text,
                imageUrl: data.imageUrl,
                videoUrl: data.videoUrl,
                msgByUserId: data.sender, // Assuming the sender is the user sending the message
                conversationId: conversation._id, // Associate message with conversation
            });
            const savedMessage = await message.save();

            // Push the message ID into the conversation
            conversation.messages.push(savedMessage._id);
            await conversation.save(); // Save the updated conversation

            // Emit the new message to both users
            io.to(data.sender).emit('message', savedMessage);
            io.to(data.receiver).emit('message', savedMessage);
            
        } catch (error) {
            console.error('Error handling new message:', error);
            // Optionally, emit an error message to the client
            socket.emit('error', { message: 'Could not send message' });
        }
    });

    // Event for typing indicator
    socket.on('typing', (receiverId) => {
        socket.to(receiverId).emit('typing', user._id);
    });

    // Event to handle user disconnection
    socket.on('disconnect', () => {
        onlineUser.delete(user._id.toString());
        console.log('User disconnected:', user._id.toString());
        io.emit('onlineUser', Array.from(onlineUser));
    });
});

// Export the app and server (if needed for testing or further development)
module.exports = {
    app,
    server,
};

// Start the server
// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });
