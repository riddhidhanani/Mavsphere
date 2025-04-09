import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    const searchQuery = request.nextUrl.searchParams.get("q");
    if (!searchQuery) {
      return new Response(JSON.stringify([]), { status: 200 });
    }

    const searchQueryLower = searchQuery.toLowerCase();

    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            OR: [
              { firstName: { contains: searchQueryLower } },
              { lastName: { contains: searchQueryLower } },
              { username: { contains: searchQueryLower } },
            ],
          },
          { id: { not: session.user.id } }, // Exclude current user
        ],
      },
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
      take: 10, // Limit results
    });

    return new Response(JSON.stringify(users), { status: 200 });
  } catch (error) {
    console.error("Error searching users:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
