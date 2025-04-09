import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import ProfileContent from "@/components/profile-content";
import LayoutComponent from "@/components/layout-component";

export default async function ProfilePage({ params }) {
  const { username } = params;
  const session = await getServerSession(authOptions);

  return (
    <LayoutComponent childPage="profile">
      <ProfileContent username={username} sessionEmail={session?.user?.email} />
    </LayoutComponent>
  );
}

// Optional: Add generateStaticParams if you want to pre-render certain profiles
export async function generateStaticParams() {
  return [];
}
