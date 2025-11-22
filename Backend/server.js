const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const cors = require("cors");
const configSocketIO = require("./controllers/chat.controller");

const app = express();

// Express CORS
app.use(cors({
    origin: ["https://omee-chat-app.netlify.app/"],
    methods: ["GET", "POST"]
}));

const server = http.createServer(app);

// Socket CORS
const io = new Server(server, {
    cors: {
        origin: ["https://omee-chat-app.netlify.app/"],
        methods: ["GET", "POST"]
    }
});

// configSocketIO(io);
configSocketIO(io);

server.listen(5000, () => {
    console.log("Server running on port 5000");
});
