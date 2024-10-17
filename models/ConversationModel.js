const mongoose = require('mongoose');

// Define the message schema
const messageSchema = new mongoose.Schema({
    text: {
        type: String,
        default: "", // Default value for message text
    },
    imageUrl: {
        type: String,
        default: "", // Default value for image URLs
    },
    videoUrl: {
        type: String,
        default: "", // Default value for video URLs
    },
    seen: {
        type: Boolean,
        default: false, // Default value indicating whether the message is seen
    },
    msgByUserId: {
        type: mongoose.Schema.Types.ObjectId, // Use Types.ObjectId for better clarity
        required: true,
        ref: 'User', // Reference to User model
    }
}, {
    timestamps: true // Automatically create createdAt and updatedAt fields
});

// Define the conversation schema
const conversationSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User', // Reference to User model
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User', // Reference to User model
    },
    messages: [{
        type: mongoose.Schema.Types.ObjectId, // Reference to Message model
        ref: 'Message',
    }]
}, {
    timestamps: true // Automatically create createdAt and updatedAt fields
});

// Create models for both schemas
const MessageModel = mongoose.model('Message', messageSchema);
const ConversationModel = mongoose.model('Conversation', conversationSchema);

// Export the models
module.exports = {
    MessageModel,
    ConversationModel,
};
