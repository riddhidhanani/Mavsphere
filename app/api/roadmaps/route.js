import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    if (!type) {
      return NextResponse.json(
        { error: "Type parameter is required" },
        { status: 400 }
      );
    }

    const roadmaps = await prisma.roadmap.findMany({
      where: {
        type: type,
      },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        link: true,
        downloadLink: true,
        type: true,
      },
    });

    console.log("roadmaps/route.ts : API response:", roadmaps);
    return NextResponse.json(roadmaps);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Optional: Add POST endpoint to create new roadmaps
export async function POST(request) {
  try {
    const body = await request.json();

    const roadmap = await prisma.roadmap.create({
      data: {
        title: body.title,
        description: body.description,
        type: body.type,
        content: body.content,
        link: body.link,
        downloadLink: body.downloadLink,
      },
    });

    return NextResponse.json(roadmap);
  } catch (error) {
    console.error("Error creating roadmap:", error);
    return NextResponse.json(
      { error: "Failed to create roadmap" },
      { status: 500 }
    );
  }
}

// Optional: Add PUT endpoint to update existing roadmaps
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    const roadmap = await prisma.roadmap.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(roadmap);
  } catch (error) {
    console.error("Error updating roadmap:", error);
    return NextResponse.json(
      { error: "Failed to update roadmap" },
      { status: 500 }
    );
  }
}

// Optional: Add DELETE endpoint to remove roadmaps
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID parameter is required" },
        { status: 400 }
      );
    }

    await prisma.roadmap.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting roadmap:", error);
    return NextResponse.json(
      { error: "Failed to delete roadmap" },
      { status: 500 }
    );
  }
}
