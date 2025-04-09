import { Server } from "socket.io";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const ioHandler = async (req) => {
  if (!global.io) {
    console.log("Initializing socket.io server...");

    const io = new Server({
      path: "/api/socket",
      addTrailingSlash: false,
      cors: {
        origin: process.env.NEXT_PUBLIC_SITE_URL,
        methods: ["GET", "POST"],
      },
    });

    io.on("connection", (socket) => {
      console.log("Client connected:", socket.id);

      socket.on("join-chat", (chatId) => {
        socket.join(chatId);
        console.log(`Socket ${socket.id} joined chat: ${chatId}`);
      });

      socket.on("leave-chat", (chatId) => {
        socket.leave(chatId);
        console.log(`Socket ${socket.id} left chat: ${chatId}`);
      });

      socket.on("send-message", async (message) => {
        io.to(message.conversationId).emit("message-received", message);
      });

      socket.on("send-group-message", async (message) => {
        io.to(message.groupId).emit("group-message-received", message);
      });

      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
      });
    });

    global.io = io;
  }

  return new Response("Socket is running", {
    status: 200,
  });
};

export { ioHandler as GET, ioHandler as POST };
