import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    // Fetch mentor with their profile
    const mentor = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        mentorProfile: true,
      },
    });

    if (!mentor.isMentor) {
      return new Response("Unauthorized - Mentor access only", { status: 403 });
    }

    // Helper function to check if guidance areas match
    const matchesGuidanceAreas = (areasForGuidance, mentorProfile) => {
      const areas = areasForGuidance.toLowerCase();
      return (
        (areas.includes("academic") && mentorProfile.academicGuidance) ||
        (areas.includes("career") && mentorProfile.careerAdvice) ||
        (areas.includes("research") && mentorProfile.researchSupport)
      );
    };

    const applications = await prisma.mentorshipApplication.findMany({
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            skills: {
              select: {
                technicalSkills: true,
              },
            },
          },
        },
      },
      where: {
        status: "pending",
      },
    });

    // Filter applications based on matching guidance areas
    const filteredApplications = applications.filter((app) =>
      matchesGuidanceAreas(app.areasForGuidance, mentor.mentorProfile)
    );

    const formattedApplications = filteredApplications.map((app) => ({
      id: app.id,
      name: `${app.user.firstName} ${app.user.lastName}`,
      program: app.program,
      personalStatement: app.personalStatement,
      areasForGuidance: app.areasForGuidance,
      avatar: "/placeholder.svg?height=40&width=40",
      skills:
        app.user.skills?.technicalSkills
          ?.split(",")
          .map((skill) => skill.trim()) || [],
    }));

    return new Response(JSON.stringify(formattedApplications), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
