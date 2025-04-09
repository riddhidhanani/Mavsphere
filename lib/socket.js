import { Server } from "socket.io";

const initSocket = (server) => {
  const io = new Server(server);

  io.on("connection", (socket) => {
    socket.on("join-chat", (chatId) => {
      socket.join(chatId);
    });

    socket.on("leave-chat", (chatId) => {
      socket.leave(chatId);
    });

    socket.on("new-message", (message) => {
      io.to(message.conversationId).emit("message-received", message);
    });

    socket.on("new-group-message", (message) => {
      io.to(message.groupId).emit("group-message-received", message);
    });
  });

  return io;
};

export default initSocket;
