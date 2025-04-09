// Home Page - Fetch posts

import prisma from "../../../../lib/prisma";

export async function GET(request, { params }) {
  const { searchParams } = new URL(request.url);
  const forumId = searchParams.get("forumId");
  console.log("Selected Forum : ", forumId);

  if (!forumId) {
    return new Response("Forum ID is required", { status: 400 });
  }

  try {
    let posts;

    if (forumId === "all") {
      posts = await prisma.forumPost.findMany({
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
        take: 5,
      });
    } else {
      posts = await prisma.forumPost.findMany({
        where: { forumId: Number(forumId) },
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
        take: 5,
      });
    }

    if (posts.length === 0) {
      return new Response("No posts found", { status: 200 });
    }

    return new Response(JSON.stringify(posts), { status: 200 });
  } catch (error) {
    console.error("Error fetching posts for forum:", error);
    return new Response("Failed to fetch posts", { status: 500 });
  }
}
