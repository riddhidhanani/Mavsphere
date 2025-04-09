import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { groupId } = params;

    // Verify user is participant in group
    const isParticipant = await prisma.groupParticipant.findFirst({
      where: {
        groupId,
        userId: session.user.id,
      },
    });

    if (!isParticipant) {
      return new Response("Forbidden", { status: 403 });
    }

    const messages = await prisma.groupMessage.findMany({
      where: {
        groupId,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return new Response(JSON.stringify(messages), { status: 200 });
  } catch (error) {
    console.error("Error fetching group messages:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { groupId } = params;
    const { content } = await request.json();

    // Verify user is participant in group
    const isParticipant = await prisma.groupParticipant.findFirst({
      where: {
        groupId,
        userId: session.user.id,
      },
    });

    if (!isParticipant) {
      return new Response("Forbidden", { status: 403 });
    }

    const message = await prisma.groupMessage.create({
      data: {
        content,
        senderId: session.user.id,
        groupId,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
          },
        },
      },
    });

    // Update group's updatedAt
    await prisma.groupChat.update({
      where: { id: groupId },
      data: { updatedAt: new Date() },
    });

    return new Response(JSON.stringify(message), { status: 201 });
  } catch (error) {
    console.error("Error creating group message:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
