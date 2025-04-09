// Subscribe or unsubscribe to a forum

import prisma from "../../../../lib/prisma";

export async function POST(request) {
  const { userId, forumId, action } = await request.json();

  if (!userId || !forumId) {
    return new Response("User ID and Forum ID are required", { status: 400 });
  }

  try {
    if (action === "subscribe") {
      await prisma.forum.update({
        where: { id: forumId },
        data: {
          users: {
            connect: { id: userId },
          },
        },
      });

      return new Response("Subscribed successfully", { status: 200 });
    } else if (action === "unsubscribe") {
      await prisma.forum.update({
        where: { id: forumId },
        data: {
          users: {
            disconnect: { id: userId },
          },
        },
      });

      return new Response("Unsubscribed successfully", { status: 200 });
    } else {
      return new Response("Invalid action", { status: 400 });
    }
  } catch (error) {
    console.error(`Error performing ${action}:`, error);
    return new Response(`Failed to ${action} forum`, { status: 500 });
  }
}
