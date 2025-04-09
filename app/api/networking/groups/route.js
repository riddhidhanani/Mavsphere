import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Get groups where user is a participant
    const groups = await prisma.groupChat.findMany({
      where: {
        participants: {
          some: {
            userId: session.user.id,
          },
        },
      },
      include: {
        participants: {
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
          },
        },
        _count: {
          select: {
            participants: true,
          },
        },
      },
    });

    // Transform the data to include member count
    const formattedGroups = groups.map((group) => ({
      id: group.id,
      name: group.name,
      memberCount: group._count.participants,
      participants: group.participants.map((p) => p.user),
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
    }));

    return new Response(JSON.stringify(formattedGroups), { status: 200 });
  } catch (error) {
    console.error("Error fetching groups:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { name, participantIds } = await request.json();

    // Create group with participants
    const group = await prisma.groupChat.create({
      data: {
        name,
        participants: {
          create: [
            { userId: session.user.id },
            ...participantIds.map((id) => ({ userId: id })),
          ],
        },
      },
      include: {
        participants: {
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
          },
        },
      },
    });

    return new Response(JSON.stringify(group), { status: 201 });
  } catch (error) {
    console.error("Error creating group:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
