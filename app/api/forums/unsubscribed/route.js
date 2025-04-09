// Fetch unsubscribed forums

import prisma from "../../../../lib/prisma";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return new Response("User ID is required", { status: 400 });
  }

  try {
    const unsubscribedForums = await prisma.forum.findMany({
        where: {
            users: {
                none: {
                    id: userId,
                },
            },
        },
        include: {
            users: true, // Include the users for each forum to get the subscriber count
            posts: {
                select: {
                    id: true, // We only need the ID to count the number of posts
                },
            },
        },
        orderBy: { createdAt: "asc" },
    });

    const sortedUnsubscribedForums = unsubscribedForums.sort(
      (a, b) => b.users.length - a.users.length
    );

    console.log("Unsubscribed Forums:", sortedUnsubscribedForums);
    return new Response(JSON.stringify(sortedUnsubscribedForums ?? []), {
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching unsubscribed forums:", error);
    return new Response("Failed to fetch unsubscribed forums", { status: 500 });
  }
}
