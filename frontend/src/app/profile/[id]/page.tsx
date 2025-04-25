import { getAuthToken } from "@/lib/api/authToken.cookie";
import { getUserProfile } from "@/lib/api/profile.calls";
import Profile from "@/components/profile";
import { Metadata } from "next";
import { PostCard } from "@/components/posts";
import { Alert } from "flowbite-react";
import { redirect } from "next/navigation";

interface ProfilePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: ProfilePageProps): Promise<Metadata> {
  try {
    const { id: userId } = await params;

    const profile = await getUserProfile(userId);
    return {
      title: `${profile.username}'s Profile | Blog Pro`,
      description: profile.bio || `Profile page for ${profile.username}`,
      openGraph: {
        title: `${profile.username}'s Profile`,
        description: profile.bio || `View ${profile.username}'s profile`,
        images: profile.profilePhoto?.url
          ? [
              {
                url: profile.profilePhoto.url,
                width: 96,
                height: 96,
                alt: `${profile.username}'s profile photo`,
              },
            ]
          : [],
      },
    };
  } catch {
    return {
      title: "Profile Not Found",
      description: "The profile you're looking for doesn't exist",
    };
  }
}

const ProfilePage = async ({ params }: ProfilePageProps) => {
  // await new Promise((resolver) => setTimeout(resolver, 10000));

  const token = await getAuthToken();

  if (!token) {
    redirect("/login");
  }

  const { id: userId } = await params;

  const profile = await getUserProfile(userId);

  return (
    <section className="container mx-auto p-6">
      <Profile profile={profile} userId={userId} token={token} />
      <div className="mt-6">
        {profile.posts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {profile.posts.map((post, index) => (
                <PostCard key={post._id} {...post} index={index} />
              ))}
            </div>
          </>
        ) : (
          <Alert color="info" className="lg:w-2/5 mx-auto" role="status">
            {profile?.username} Have no{" "}
            <span className="font-medium" aria-live="polite">
              posts
            </span>{" "}
            to show!
          </Alert>
        )}
      </div>
    </section>
  );
};

export default ProfilePage;
