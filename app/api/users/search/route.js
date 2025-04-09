import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return new Response(JSON.stringify({ users: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const userEmail = session?.user?.email;
    const searchQuery = query.toLowerCase();

    const currentUser = userEmail
      ? await prisma.user.findUnique({
          where: { email: userEmail },
          select: { id: true },
        })
      : null;

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { firstName: { contains: searchQuery } },
          { lastName: { contains: searchQuery } },
          { username: { contains: searchQuery } },
          { email: { contains: searchQuery } },
        ],
        ...(userEmail
          ? {
              NOT: {
                email: userEmail,
              },
            }
          : {}),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        email: true,
        isMentor: true,
      },
      take: 10,
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
    });

    return new Response(JSON.stringify({ users }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Search error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to search users",
        details: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
