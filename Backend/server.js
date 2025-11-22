const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

// Express app from app.js
const app = require("./app");

// ----------------------
// CORS for Express APIs
// ----------------------
app.use(
    cors({
        origin: [
            "https://omee-chat-app.netlify.app",
            "http://localhost:3000",
            "http://localhost:5173"
        ],
        methods: ["GET", "POST"],
    })
);

// Create HTTP server
const server = http.createServer(app);

// ----------------------
// Socket.io Setup + CORS
// ----------------------
const io = new Server(server, {
    cors: {
        origin: [
            "https://omee-chat-app.netlify.app",
            "http://localhost:3000",
            "http://localhost:5173"
        ],
        methods: ["GET", "POST"],
    },
});

// socket logic
const configSocketIO = require("./controllers/chat.controller");
configSocketIO(io);

// ----------------------
// PORT (Local + Render)
// ----------------------
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log("🔥 Server running on port:", PORT);
});
