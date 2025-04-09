import MentorshipProgramComponent from "@/components/mentorship-program";
import MentorProgramComponent from "@/components/mentor-program";
import LayoutComponent from "@/components/layout-component";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";

export default async function Page() {
  // Get the current session
  const session = await getServerSession();

  // If no session, user is not logged in
  if (!session?.user?.email) {
    return <div>Please log in to access the mentorship program</div>;
  }

  // Get user data from database
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  return (
    <LayoutComponent childPage="/resources/mentorship-program">
      {user?.isMentor ? (
        <MentorProgramComponent />
      ) : (
        <MentorshipProgramComponent />
      )}
    </LayoutComponent>
  );
}
