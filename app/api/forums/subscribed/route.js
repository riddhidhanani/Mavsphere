// Fetch subscribed forums

import prisma from "../../../../lib/prisma";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return new Response("User ID is required", { status: 400 });
  }
  
  try {
    const subscribedForums = await prisma.forum.findMany({
        where: {
            users: {
                some: {
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

    const sortedSubscribedForums = subscribedForums.sort(
      (a, b) => b.users.length - a.users.length
    );

    console.log("Subscribed Forums:", sortedSubscribedForums);
    return new Response(JSON.stringify(sortedSubscribedForums ?? []), {
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching subscribed forums:", error);
    return new Response("Failed to fetch subscribed forums", { status: 500 });
  }
}
