function configSocketIO(io) {

    let onlineUsers = 0;

    io.on("connection", (socket) => {

        onlineUsers++;
        io.emit("online-count", onlineUsers);

        socket.on("message-send", (data) => {
            socket.broadcast.emit("message-received", {
                ...data,
                senderId: socket.id
            });
        });

        socket.on("new_user_join", ({ username, sendTime }) => {
            console.log("User joined:", username);
            socket.username = username;

            socket.broadcast.emit("message-received", {
                message: `${username} joined the chat`,
                systemMessage: true,
                sendTime,
            });
        });

        socket.on("user_leave", ({ username }) => {
            console.log("User left via button:", username);

            socket.broadcast.emit("message-received", {
                message: `${username} left the chat.`,
                systemMessage: true,
            });
        });

        socket.on("disconnect", () => {

            onlineUsers--;
            io.emit("online-count", onlineUsers);

            socket.broadcast.emit("message-received", {
                message: `${socket.username} left the chat`,
                systemMessage: true,
            });
        });

    });
}

module.exports = configSocketIO;
