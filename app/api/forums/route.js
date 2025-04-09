// Create a new forum

import prisma from "../../../lib/prisma";

export async function POST(request) {
  const { title, description, userId } = await request.json();

  if (!title || !userId) {
    return new Response("Title and User ID are required", { status: 400 });
  }

  try {
    const newForum = await prisma.forum.create({
      data: {
        title,
        description: description || null,
        users: {
          connect: { id: userId }, // Connect the creator as a subscriber
        },
      },
    });

    return new Response(JSON.stringify(newForum), { status: 201 });
  } catch (error) {
    console.error("Error creating forum:", error);
    return new Response("Failed to create forum", { status: 500 });
  }
}
