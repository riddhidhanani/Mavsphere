import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Helper function to initialize user profile if needed
async function initializeUserProfile(userId) {
  const profile = await prisma.userProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    await prisma.userProfile.create({
      data: { userId },
    });
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        profile: true,
        settings: true,
        education: true,
        experience: true,
        skills: true,
      },
    });

    console.log("Fetched user data:", user);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Format the response
    return NextResponse.json({
      account: {
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email,
        username: user.username || "",
        isMentor: user.isMentor || false,
      },
      profile: {
        linkedin: user.profile?.linkedinUrl || "",
        github: user.profile?.githubUrl || "",
        kaggle: user.profile?.kaggleUrl || "",
        avatar: user.profile?.avatarUrl || "",
      },
      settings: {
        email_notifications: user.settings?.emailNotifications || false,
        push_notifications: user.settings?.pushNotifications || false,
        message_notifications: user.settings?.messageNotifications || false,
        profile_visibility: user.settings?.profileVisibility || false,
        show_email: user.settings?.showEmail || false,
        show_linkedin: user.settings?.showLinkedin || false,
        show_github: user.settings?.showGithub || false,
        show_kaggle: user.settings?.showKaggle || false,
      },
      education: user.education.map((edu) => ({
        id: edu.id,
        degree_title: edu.degreeTitle,
        institution: edu.institution,
        start_year: edu.startYear,
        end_year: edu.endYear,
      })),
      experience: user.experience.map((exp) => ({
        id: exp.id,
        position_title: exp.positionTitle,
        organization: exp.organization,
        start_date: exp.startDate.toISOString().split("T")[0],
        end_date: exp.endDate?.toISOString().split("T")[0] || null,
        responsibilities: exp.responsibilities,
      })),
      skills: {
        publications: user.skills?.publications || "",
        research_areas: user.skills?.researchAreas || "",
        technical_skills: user.skills?.technicalSkills || "",
      },
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const data = await request.json();
    console.log("Received data:", data);
    const { type, ...updateData } = data;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    switch (type) {
      case "account":
        console.log("Updating account data:", {
          firstName: updateData.firstName,
          lastName: updateData.lastName,
          username: updateData.username,
        });

        await prisma.user.update({
          where: { id: user.id },
          data: {
            firstName: updateData.firstName,
            lastName: updateData.lastName,
            username: updateData.username,
          },
        });

        console.log("Account update completed");
        break;

      case "password":
        // Verify current password
        const passwordUser = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: {
            id: true,
            password: true,
          },
        });

        if (!passwordUser?.password) {
          return NextResponse.json(
            { error: "User not found or no password set" },
            { status: 404 }
          );
        }

        // Verify current password
        const isValid = await bcrypt.compare(
          updateData.currentPassword,
          passwordUser.password
        );

        if (!isValid) {
          return NextResponse.json(
            { error: "Current password is incorrect" },
            { status: 400 }
          );
        }

        // Validate new password
        if (!updateData.newPassword || updateData.newPassword.length < 8) {
          return NextResponse.json(
            { error: "New password must be at least 8 characters long" },
            { status: 400 }
          );
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(updateData.newPassword, salt);

        // Update password in database
        await prisma.user.update({
          where: { id: passwordUser.id },
          data: { password: hashedPassword },
        });

        return NextResponse.json({
          message: "Password updated successfully",
          requiresReauth: true,
        });

      case "settings":
        console.log("Updating settings:", updateData);

        await prisma.userSettings.upsert({
          where: {
            userEmail: user.email, // Use email as the unique identifier
          },
          create: {
            userEmail: user.email, // Required for create
            emailNotifications: updateData.email_notifications,
            pushNotifications: updateData.push_notifications,
            messageNotifications: updateData.message_notifications,
            profileVisibility: updateData.profile_visibility,
            showEmail: updateData.show_email,
            showLinkedin: updateData.show_linkedin,
            showGithub: updateData.show_github,
            showKaggle: updateData.show_kaggle,
          },
          update: {
            emailNotifications: updateData.email_notifications,
            pushNotifications: updateData.push_notifications,
            messageNotifications: updateData.message_notifications,
            profileVisibility: updateData.profile_visibility,
            showEmail: updateData.show_email,
            showLinkedin: updateData.show_linkedin,
            showGithub: updateData.show_github,
            showKaggle: updateData.show_kaggle,
          },
        });

        console.log("Settings update completed");
        break;

      case "education":
        console.log("Processing education update:", updateData);
        if (updateData.id) {
          // Update existing education entry
          await prisma.education.update({
            where: {
              id: parseInt(updateData.id),
              userId: user.id,
            },
            data: {
              degreeTitle: updateData.degree_title,
              institution: updateData.institution,
              startYear: parseInt(updateData.start_year),
              endYear: updateData.end_year
                ? parseInt(updateData.end_year)
                : null,
            },
          });
        } else {
          // Create new education entry
          await prisma.education.create({
            data: {
              userId: user.id,
              degreeTitle: updateData.degree_title,
              institution: updateData.institution,
              startYear: parseInt(updateData.start_year),
              endYear: updateData.end_year
                ? parseInt(updateData.end_year)
                : null,
            },
          });
        }
        console.log("Education update completed");
        break;

      case "experience":
        if (updateData.id) {
          // Update existing experience entry
          await prisma.experience.update({
            where: {
              id: parseInt(updateData.id),
              userId: user.id,
            },
            data: {
              positionTitle: updateData.position_title,
              organization: updateData.organization,
              startDate: new Date(updateData.start_date),
              endDate: updateData.end_date
                ? new Date(updateData.end_date)
                : null,
              responsibilities: updateData.responsibilities,
            },
          });
        } else {
          // Create new experience entry
          await prisma.experience.create({
            data: {
              userId: user.id,
              positionTitle: updateData.position_title,
              organization: updateData.organization,
              startDate: new Date(updateData.start_date),
              endDate: updateData.end_date
                ? new Date(updateData.end_date)
                : null,
              responsibilities: updateData.responsibilities,
            },
          });
        }
        break;

      case "skills":
        // Validate skills data
        if (
          typeof updateData.technical_skills !== "string" ||
          typeof updateData.research_areas !== "string" ||
          typeof updateData.publications !== "string"
        ) {
          return NextResponse.json(
            { error: "Invalid skills data format" },
            { status: 400 }
          );
        }

        // Trim and validate lengths
        const technical_skills = updateData.technical_skills.trim();
        const research_areas = updateData.research_areas.trim();
        const publications = updateData.publications.trim();

        if (
          technical_skills.length > 2000 ||
          research_areas.length > 2000 ||
          publications.length > 5000
        ) {
          return NextResponse.json(
            { error: "Skills content exceeds maximum length" },
            { status: 400 }
          );
        }

        console.log("Updating skills for user:", user.id);

        await prisma.userSkills.upsert({
          where: { userId: user.id },
          create: {
            userId: user.id,
            publications: publications,
            researchAreas: research_areas,
            technicalSkills: technical_skills,
          },
          update: {
            publications: publications,
            researchAreas: research_areas,
            technicalSkills: technical_skills,
          },
        });

        console.log("Skills update completed");
        break;

      case "profile":
        await prisma.userProfile.upsert({
          where: { userId: user.id },
          create: {
            userId: user.id,
            linkedinUrl: updateData.linkedin,
            githubUrl: updateData.github,
            kaggleUrl: updateData.kaggle,
          },
          update: {
            linkedinUrl: updateData.linkedin,
            githubUrl: updateData.github,
            kaggleUrl: updateData.kaggle,
          },
        });
        break;

      default:
        return NextResponse.json(
          { error: "Invalid update type" },
          { status: 400 }
        );
    }

    return NextResponse.json({ message: "Updated successfully" });
  } catch (error) {
    console.error("Error updating data:", error);
    return NextResponse.json(
      { error: "Failed to update data" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const id = searchParams.get("id");

    if (!type || !id) {
      return NextResponse.json(
        { error: "Missing type or id parameter" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    switch (type) {
      case "education":
        await prisma.education.deleteMany({
          where: {
            id: parseInt(id),
            userId: user.id,
          },
        });
        break;

      case "experience":
        await prisma.experience.deleteMany({
          where: {
            id: parseInt(id),
            userId: user.id,
          },
        });
        break;

      default:
        return NextResponse.json(
          { error: "Invalid delete type" },
          { status: 400 }
        );
    }

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("Error deleting data:", error);
    return NextResponse.json(
      { error: "Failed to delete data" },
      { status: 500 }
    );
  }
}
