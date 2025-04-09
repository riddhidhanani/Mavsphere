import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    const conversations = await prisma.conversationParticipant.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        conversation: {
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
            messages: {
              orderBy: {
                createdAt: "desc",
              },
              take: 1,
            },
          },
        },
      },
      orderBy: {
        conversation: {
          updatedAt: "desc",
        },
      },
    });

    // Format the response
    const formattedConversations = conversations.map((conv) => {
      const otherParticipant = conv.conversation.participants.find(
        (p) => p.userId !== session.user.id
      );
      const lastMessage = conv.conversation.messages[0];

      return {
        id: conv.conversation.id,
        participant: {
          id: otherParticipant.user.id,
          firstName: otherParticipant.user.firstName,
          lastName: otherParticipant.user.lastName,
          username: otherParticipant.user.username,
          avatarUrl: otherParticipant.user.profile?.avatarUrl,
        },
        lastMessage: lastMessage,
      };
    });

    return new Response(JSON.stringify(formattedConversations), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
