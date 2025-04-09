import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");
    const session = await getServerSession(authOptions);

    if (!username || username.trim() === "") {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { username: username.trim() },
      include: {
        profile: true,
        settings: true,
        education: {
          orderBy: {
            startYear: "desc",
          },
        },
        experience: {
          orderBy: {
            startDate: "desc",
          },
        },
        skills: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const isOwnProfile = session?.user?.email === user.email;
    const response = {
      name: `${user.firstName} ${user.lastName}`,
      username: user.username,
      email: session?.user?.email === user.email ? user.email : null,
      currentInstitution: user.profile?.currentInstitution || "",
      location: user.profile?.location || "",
      bio: user.profile?.bio || "",
      linkedin: user.settings.showLinkedin ? user.profile?.linkedinUrl : null,
      github: user.settings.showGithub ? user.profile?.githubUrl : null,
      kaggle: user.settings.showKaggle ? user.profile?.kaggleUrl : null,
      education: user.education.map((edu) => ({
        degree_title: edu.degreeTitle,
        institution: edu.institution,
        start_year: edu.startYear,
        end_year: edu.endYear,
      })),
      experience: user.experience.map((exp) => ({
        position_title: exp.positionTitle,
        organization: exp.organization,
        start_date: exp.startDate,
        end_date: exp.endDate,
        responsibilities: exp.responsibilities || "",
      })),
      skills: {
        publications: user.skills?.publications || "",
        research_areas: user.skills?.researchAreas || "",
        technical_skills: user.skills?.technicalSkills || "",
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}
