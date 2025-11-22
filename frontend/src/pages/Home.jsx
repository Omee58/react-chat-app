import { useEffect, useRef, useState } from "react";
import { getLocalData, setLocalData } from "../utils/localStorage";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000", { path: "/socket.io" });

export default function Home() {

    const [username, setUsername] = useState("");
    const [isNameAvailable, setIsNameAvailable] = useState(false);
    const [messageInput, setMessageInput] = useState("");
    const [onlineUsers, setOnlineUsers] = useState(0);
    const [message, setMessage] = useState([]);
    const messageRef = useRef();

    const now = new Date();
    let hour = now.getHours().toString().padStart(2, '0');
    let minute = now.getMinutes().toString().padStart(2, '0');
    const sendTime = `${hour}:${minute}`;

    const handleJoin = () => {
        if (!username.trim()) return;
        setLocalData("chat_user", { name: username });
        setIsNameAvailable(true);
        socket.emit("new_user_join", { username, sendTime });
    };

    useEffect(() => {
        const user = getLocalData("chat_user");

        if (user && user.name) {
            setIsNameAvailable(true);
            setUsername(user.name);
            socket.emit("new_user_join", { username: user.name, sendTime });
        }

        socket.on("message-received", (data) => {
            setMessage(prev => [
                ...prev,
                { ...data, isMe: data.senderId === socket.id }
            ]);
        });

        socket.on("online-count", (count) => {
            setOnlineUsers(count);
        });


        socket.on("connect", () => {
            // console.log("Connected:", socket.id);
        });

        return () => {
            socket.off("connect");
            socket.off("message-received");
            socket.off("new_user_join");
        };
    }, []);



    function handleSendMessage() {
        socket.emit("message-send", {
            message: messageInput,
            from: username,
            sendTime,
        });

        setMessage(prev => [
            ...prev,
            { message: messageInput, from: username, sendTime, isMe: true }
        ]);

        setMessageInput('');
        messageRef.current.focus();
    }

    return (
        <>
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">

                {/* ---------- ENTER NAME SCREEN ---------- */}
                {!isNameAvailable && (
                    <div className="w-full max-w-md bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-8 animate-fadeIn border border-white/40">
                        <h2 className="text-3xl font-bold text-center text-gray-800">
                            Welcome 👋
                        </h2>

                        <p className="text-gray-500 text-center mt-2 mb-8">
                            Enter your name to join the conversation
                        </p>

                        <input
                            type="text"
                            placeholder="Your name..."
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                            className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition bg-white"
                        />

                        <button
                            onClick={handleJoin}
                            className="w-full mt-5 bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 active:scale-95 transition-all shadow-lg"
                        >
                            Join Chat
                        </button>
                    </div>
                )}

                {/* ---------- CHAT SCREEN ---------- */}
                {isNameAvailable && (
                    <div className="w-[520px] h-[600px] bg-white/70 backdrop-blur-2xl border border-white/40 shadow-2xl rounded-3xl flex flex-col overflow-hidden">

                        {/* ---------- HEADER ---------- */}
                        <div className="p-4 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white flex items-center gap-3 shadow">
                            <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-6 h-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 12a3 3 0 1 0-3-3 3 3 0 0 0 3 3zM19 12a3 3 0 1 0-3-3 3 3 0 0 0 3 3zM5 12a3 3 0 1 0-3-3 3 3 0 0 0 3 3z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M2 20c0-3 3-5 7-5s7 2 7 5M7 20c0-3 3-5 7-5 4 0 7 2 7 5"
                                    />
                                </svg>

                            </div>

                            <div>
                                <p className="font-semibold text-[16px]">Group</p>
                                <p className="text-[12px] text-indigo-200">{onlineUsers} members online</p>
                            </div>
                        </div>

                        {/* ---------- MESSAGES AREA ---------- */}
                        <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-3">

                            {message.length === 0 && (
                                <p className="text-center text-gray-400 mt-3 select-none">
                                    No messages yet...
                                </p>
                            )}

                            {message.map((msg, i) => (
                                <div key={msg.id || i}>

                                    {/* My Messages */}
                                    {msg.isMe ? (
                                        <div className="flex justify-end">
                                            <div className="bg-indigo-600 text-white p-3 rounded-2xl rounded-br-none max-w-[70%] shadow-lg">
                                                <p className="text-[14px]">{msg.message}</p>
                                                <p className="text-[10px] text-indigo-200 text-right mt-1">
                                                    {msg.sendTime}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (

                                        // System Messages
                                        msg.systemMessage ? (
                                            <p className="text-center text-gray-500 text-[13px] mt-2 italic">
                                                {msg.message}
                                            </p>
                                        ) : (

                                            // Others Messages
                                            <div className="flex items-start gap-2">
                                                <div className="bg-white p-3 rounded-2xl shadow-md max-w-[70%] border border-gray-100">
                                                    <p className="text-[13px] font-semibold text-indigo-600">{msg.from}</p>
                                                    <p className="text-[14px]">{msg.message}</p>
                                                    <p className="text-[10px] text-gray-400 text-right mt-1">{msg.sendTime}</p>
                                                </div>
                                            </div>
                                        )
                                    )}

                                </div>
                            ))}

                        </div>

                        {/* ---------- INPUT AREA ---------- */}
                        <div className="p-3 bg-white border-t flex items-center gap-3">

                            <input
                                autoFocus
                                ref={messageRef}
                                className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-600"
                                type="text"
                                placeholder="Type a message..."
                                value={messageInput}
                                onChange={(e) => setMessageInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                            />

                            <button
                                onClick={handleSendMessage}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-full shadow-lg transition"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg"
                                    className="w-5 h-5" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round"
                                        d="M5 12l14-7-4 14-3-4-7-3z" />
                                </svg>
                            </button>

                        </div>

                    </div>
                )}
            </div>

        </>
    );
}
