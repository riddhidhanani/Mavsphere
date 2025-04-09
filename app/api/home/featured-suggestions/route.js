import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Get current user's connections (both sent and received)
    const connections = await prisma.userConnection.findMany({
      where: {
        OR: [{ userId: session.user.id }, { connectedId: session.user.id }],
        status: "accepted",
      },
      select: {
        userId: true,
        connectedId: true,
      },
    });

    // Extract all connected user IDs
    const connectedUserIds = connections.flatMap((conn) => [
      conn.userId,
      conn.connectedId,
    ]);
    const uniqueConnectedUserIds = [...new Set(connectedUserIds)];

    // Find featured users not connected to current user
    const featuredSuggestions = await prisma.user.findMany({
      where: {
        AND: [
          { isFeatured: true },
          { id: { not: session.user.id } },
          { id: { notIn: uniqueConnectedUserIds } },
        ],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        profile: {
          select: {
            bio: true,
            currentInstitution: true,
            avatarUrl: true,
          },
        },
      },
      take: 3,
    });

    return new Response(JSON.stringify(featuredSuggestions), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching featured suggestions:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch featured suggestions" }),
      { status: 500 }
    );
  }
}
