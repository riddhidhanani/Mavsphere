import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { id } = params;
    const { action } = await request.json();

    // Verify the current user is a mentor
    const mentor = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isMentor: true },
    });

    if (!mentor?.isMentor) {
      return new Response("Unauthorized - Mentor access only", { status: 403 });
    }

    // Update application status
    const application = await prisma.mentorshipApplication.update({
      where: { id: parseInt(id) },
      data: { status: action === "approve" ? "approved" : "rejected" },
      include: { user: true },
    });

    if (action === "approve") {
      // Create mentorship relationship
      await prisma.mentorshipRelationship.create({
        data: {
          mentorId: session.user.id,
          menteeId: application.userId,
          status: "active",
          startDate: application.startDate,
          endDate: application.endDate,
        },
      });
    }

    return new Response(JSON.stringify(application), { status: 200 });
  } catch (error) {
    console.error("Error handling application:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
