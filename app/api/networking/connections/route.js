import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    const connections = await prisma.userConnection.findMany({
      where: {
        OR: [
          { userId: session.user.id, status: "accepted" },
          { connectedId: session.user.id, status: "accepted" },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            profile: {
              select: {
                avatarUrl: true,
              },
            },
          },
        },
        connected: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            profile: {
              select: {
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    const connectedUsers = connections.map((conn) =>
      conn.userId === session.user.id ? conn.connected : conn.user
    );

    return new Response(JSON.stringify(connectedUsers), { status: 200 });
  } catch (error) {
    console.error("Error fetching connections:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
