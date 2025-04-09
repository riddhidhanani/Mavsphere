import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      orderBy: {
        date: "asc",
      },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Log session data to debug
    console.log("Session:", session);

    const body = await request.json();

    if (!body.title || !body.date || !body.location || !body.type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // First, find the user by email from session
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create event with user connection
    const event = await prisma.event.create({
      data: {
        title: body.title,
        date: new Date(body.date),
        duration: body.duration ? parseInt(body.duration) : null,
        location: body.location,
        type: body.type,
        website: body.website || null,
        description: body.description || null,
        notes: body.notes || null,
        organizer: body.organizer || null,
        hasCallForPapers: body.hasCallForPapers || false,
        user: {
          connect: {
            id: user.id,
          },
        },
      },
      include: {
        user: true,
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error("Error adding event:", error);
    return NextResponse.json(
      { error: "Failed to add event: " + error.message },
      { status: 500 }
    );
  }
}
