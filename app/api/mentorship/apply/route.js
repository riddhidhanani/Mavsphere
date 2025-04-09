import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const {
    fullName,
    email,
    university,
    program,
    areasForGuidance,
    topicOfGuidance,
    meetingFrequency,
    startDate,
    endDate,
    personalStatement,
  } = await request.json();

  try {
    console.log("Received mentorship application data:", request.body);
    const application = await prisma.mentorshipApplication.create({
      data: {
        userId: session.user.id,
        fullName,
        email,
        university,
        program,
        areasForGuidance,
        topicOfGuidance,
        meetingFrequency,
        startDate,
        endDate,
        personalStatement,
      },
    });
    console.log("Created mentorship application:", application);

    return new Response(JSON.stringify(application), { status: 201 });
  } catch (error) {
    console.error("Error submitting mentorship application:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
