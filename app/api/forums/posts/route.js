// Fetch or create posts

import prisma from "../../../../lib/prisma";

export async function GET(request, { params }) {
  const { searchParams } = new URL(request.url);
  const forumId = searchParams.get("forumId");

  if (!forumId) {
    return new Response("Forum ID is required", { status: 400 });
  }

  try {
    const posts = await prisma.forumPost.findMany({
      where: { forum: { id: parseInt(forumId) } },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profile: {
              select: {
                avatarUrl: true,
              },
            },
          },
        },
        forum: {
          select: {
            title: true,
          },
        },
      },
    });
    console.log(posts);
    return new Response(JSON.stringify(posts), { status: 200 });
  } catch (error) {
    console.error("Error fetching posts for forum:", error);
    return new Response("Failed to fetch posts", { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { title, content } = await request.json();

    const { searchParams } = new URL(request.url);
    const forumId = searchParams.get("forumId");
    const userId = searchParams.get("userId");

    if (!title || !content || !forumId || !userId) {
      return new Response(
        JSON.stringify({ message: "All fields are required" }),
        { status: 400 }
      );
    }

    const newPost = await prisma.forumPost.create({
      data: {
        forumId: parseInt(forumId),
        userId,
        title,
        content,
      },
      include: {
        user: {
          select: {
            username: true,
            profile: {
              select: {
                avatarUrl: true,
              },
            },
          },
        },
        forum: {
          select: {
            title: true,
          },
        },
      },
    });

    return new Response(JSON.stringify(newPost), { status: 201 });
  } catch (error) {
    console.error("Error creating forum post:", error);
    return new Response(
      JSON.stringify({
        message: "Failed to create post",
        error: error.message,
      }),
      { status: 500 }
    );
  }
}
