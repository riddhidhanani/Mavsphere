import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    const mentors = await prisma.user.findMany({
      where: {
        isMentor: true,
        mentorProfile: {
          isNot: null,
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        profile: {
          select: {
            avatarUrl: true,
            currentInstitution: true,
            bio: true,
          },
        },
        mentorProfile: {
          select: {
            academicGuidance: true,
            careerAdvice: true,
            researchSupport: true,
          },
        },
      },
    });

    return new Response(JSON.stringify(mentors), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching mentors:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
