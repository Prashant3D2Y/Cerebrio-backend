const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/connectDB');
const router = require('./routes/index');
const cookiesParser = require('cookie-parser');
const { getChatCompletion } = require('./groqChat'); // Import chat function
const { app, server } = require('./socket/index');
require('dotenv').config();

dotenv.config();

app.use(cors({
    origin: 'https://cerebrio-frontend.vercel.app/',
    credentials: true
}));
app.use(express.json());
app.use(cookiesParser());

// Serve static files for the chatbot UI
app.use(express.static(path.join(__dirname, '../client/public')));

const PORT = process.env.PORT || 8080;

// Chatbot API endpoint
// app.post('/api/chat', async (req, res) => {
//     const { content } = req.body;
//     try {
//         const chatCompletion = await getChatCompletion(content);
//         res.json({ message: chatCompletion.choices[0]?.message?.content || "No response" });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// });
app.post('/api/chat', async (req, res) => {
    console.log("Received content:", req.body.content); // Debug log
    const { content } = req.body;
    try {
        const chatCompletion = await getChatCompletion(content);
        res.json({ message: chatCompletion.choices[0]?.message?.content || "No response" });
    } catch (error) {
        console.error("Error in /api/chat:", error); // Debug log
        res.status(500).json({ message: error.message });
    }
});


// API Endpoints
app.use('/api', router);

connectDB().then(() => {
    console.log("Database connected");
    server.listen(PORT, () => {
        console.log("Server running at " + PORT);
    });
});
