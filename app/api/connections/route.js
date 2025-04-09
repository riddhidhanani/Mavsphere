import { auth } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET(request) {
  try {
    const session = await auth();
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;

    const connections = await prisma.userConnection.findMany({
      where: {
        userId: userId,
        status: "accepted",
      },
      include: {
        connected: true,
      },
    });

    const incomingRequests = await prisma.userConnection.findMany({
      where: {
        connectedId: userId,
        status: "pending",
      },
      include: {
        user: true,
      },
    });

    const sentRequests = await prisma.userConnection.findMany({
      where: {
        userId: userId,
        status: "pending",
      },
      include: {
        connected: true,
      },
    });

    return new Response(
      JSON.stringify({
        connections,
        incomingRequests,
        sentRequests,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /api/connections:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;
    const { connectedId } = await request.json();

    // Check if a connection already exists between the users
    const existingConnection = await prisma.userConnection.findFirst({
      where: {
        OR: [
          { userId: userId, connectedId: connectedId },
          { userId: connectedId, connectedId: userId },
        ],
      },
    });

    if (existingConnection) {
      return new Response("Connection already exists", { status: 400 });
    }

    // Create a new connection
    await prisma.userConnection.create({
      data: {
        userId: userId,
        connectedId: connectedId,
        status: "pending",
      },
    });

    return new Response("Connection request sent", { status: 200 });
  } catch (error) {
    console.error("Error creating connection:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
