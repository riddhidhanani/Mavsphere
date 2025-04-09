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
        OR: [{ userId: session.user.id }, { connectedId: session.user.id }],
        status: "accepted",
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

    const availableConnections = connections.map((connection) => {
      const otherUser =
        connection.userId === session.user.id
          ? connection.connected
          : connection.user;
      return otherUser;
    });

    return new Response(JSON.stringify(availableConnections), { status: 200 });
  } catch (error) {
    console.error("Error fetching available connections:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
