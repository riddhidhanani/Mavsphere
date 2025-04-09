import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const mentorProfile = await prisma.mentorProfile.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    return NextResponse.json(mentorProfile || {});
  } catch (error) {
    console.error("Error fetching mentor profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    console.log("Updating mentor preferences:", data);

    const mentorProfile = await prisma.mentorProfile.upsert({
      where: {
        userId: session.user.id,
      },
      update: {
        academicGuidance: data.academicGuidance,
        careerAdvice: data.careerAdvice,
        researchSupport: data.researchSupport,
      },
      create: {
        userId: session.user.id,
        academicGuidance: data.academicGuidance,
        careerAdvice: data.careerAdvice,
        researchSupport: data.researchSupport,
      },
    });

    console.log("Mentor profile updated:", mentorProfile);
    return NextResponse.json(mentorProfile);
  } catch (error) {
    console.error("Error updating mentor profile:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
