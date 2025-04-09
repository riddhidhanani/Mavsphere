import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    const mentorships = await prisma.mentorshipRelationship.findMany({
      where: {
        mentorId: session.user.id,
        status: "active",
      },
      include: {
        mentee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profile: {
              select: {
                avatarUrl: true,
                currentInstitution: true,
              },
            },
          },
        },
      },
    });

    return new Response(JSON.stringify(mentorships), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching mentees:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
