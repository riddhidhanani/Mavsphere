"use client";

import React, { useState, useEffect } from "react";
import {
  ThumbsUp,
  MessageCircle,
  Send,
  UserPlus,
  Briefcase,
  Calendar,
  Mail,
  Users,
  Globe,
  X,
  Check,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function Homepage() {
  const [postContent, setPostContent] = useState("");
  const [selectedProfile, setSelectedProfile] = useState(null);
  const username = "JohnDoe";
  const [showProfileAlert, setShowProfileAlert] = useState(false);
  const [featuredProfiles, setFeaturedProfiles] = useState([]);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(true);
  const [profileError, setProfileError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const router = useRouter();
  const { data: session, status } = useSession();
  const [subscribedForums, setSubscribedForums] = useState([]);
  const [selectedForum, setSelectedForum] = useState("all");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      setCurrentUserId(session.user.id);
    }
  }, [session, status]);

  useEffect(() => {
    if (!currentUserId) return;

    async function fetchSubscribedForums() {
      try {
        const response = await fetch(
          `/api/homepage_act/?userId=${currentUserId}`
        );
        const data = await response.json();
        setSubscribedForums(data);
      } catch (error) {
        console.error("Error fetching subscribed forums:", error);
      }
    }

    fetchSubscribedForums();
  }, [currentUserId]);

  useEffect(() => {
    setLoading(true);
    async function fetchPosts() {
      try {
        const response = await fetch(
          `/api/homepage_act/posts?forumId=${selectedForum}`
        );
        if (!response.ok) throw new Error("Failed to fetch posts");
        const data = await response.json();
        setPosts(data === "No posts found" ? [] : data);
      } catch (error) {
        console.error("Error fetching posts:", error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, [selectedForum]);

  useEffect(() => {
    // Check if the user needs to complete their profile
    const checkProfileCompletion = async () => {
      const response = await fetch("/api/settings");
      const data = await response.json();
      console.log("Profile data received:", data);
      console.log("Account details:", data.account); // The data is nested under 'account'
      const isProfileComplete =
        data.account.firstName && data.account.lastName && data.account.email;
      console.log("Is profile complete?", isProfileComplete);

      if (!isProfileComplete) {
        setShowProfileAlert(true);
      }
    };

    checkProfileCompletion();
  }, []);

  useEffect(() => {
    // Fetch featured profiles
    const fetchFeaturedProfiles = async () => {
      try {
        setIsLoadingProfiles(true);
        const response = await fetch("/api/home/featured-suggestions");

        if (!response.ok) throw new Error("Failed to fetch profiles");
        const data = await response.json();

        // Map the fetched data to match the expected format
        const formattedProfiles = data.map((profile) => ({
          id: profile.id,
          name: `${profile.firstName} ${profile.lastName}`,
          title: profile.profile?.bio?.substring(0, 50) || "No bio",
          institution: profile.profile?.currentInstitution || "No institution",
          avatar: profile.profile?.avatarUrl || "/valid-placeholder.svg",
          isConnected: false,
        }));

        setFeaturedProfiles(formattedProfiles);
      } catch (error) {
        setProfileError(error.message);
      } finally {
        setIsLoadingProfiles(false);
      }
    };

    fetchFeaturedProfiles();
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // Debug log
        console.log("Fetching notifications...");

        // Fetch user sphere notifications
        const sphereResponse = await fetch("/api/user-sphere");
        if (!sphereResponse.ok) throw new Error("Failed to fetch user sphere");
        const sphereData = await sphereResponse.json();
        console.log("Sphere data:", sphereData); // Debug log

        // Fetch mentorship applications
        const mentorshipResponse = await fetch("/api/mentorship/applications");
        if (!mentorshipResponse.ok)
          throw new Error("Failed to fetch mentorship applications");
        const mentorshipData = await mentorshipResponse.json();
        console.log("Mentorship data:", mentorshipData); // Debug log

        // Create a single notification for pending applications if any exist
        const mentorshipNotifications =
          mentorshipData.applications.length > 0
            ? [
                {
                  id: "pending-applications",
                  icon: <Users className="h-4 w-4" />,
                  content: `You have ${
                    mentorshipData.applications.length
                  } pending mentorship ${
                    mentorshipData.applications.length === 1
                      ? "application"
                      : "applications"
                  }`,
                  time: "Active",
                  type: "mentorship",
                  applicationCount: mentorshipData.applications.length,
                },
              ]
            : [];

        const connectionNotifications = sphereData.incomingRequests.map(
          (request) => ({
            id: `connection-${request.user.id}`,
            icon: <UserPlus className="h-4 w-4" />,
            content: `${request.user.firstName} ${request.user.lastName} wants to connect`,
            time: "Just now",
            type: "connection",
            userData: request.user,
          })
        );

        const combinedNotifications = [
          ...mentorshipNotifications,
          ...connectionNotifications,
        ];

        console.log("Combined notifications:", combinedNotifications); // Debug log
        setNotifications(combinedNotifications);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();

    // Set up polling
    const pollInterval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(pollInterval);
  }, []);

  const handlePost = () => {
    console.log("Posting:", postContent);
    setPostContent("");
  };

  const samplePosts = [
    {
      id: 1,
      author: "Jane Smith",
      avatar: "/placeholder.svg?height=40&width=40",
      time: "2 hours ago",
      content: "Just finished an amazing workshop on AI ethics!",
      hashtags: ["AIEthics", "TechForGood"],
      likes: 15,
      comments: 3,
    },
    {
      id: 2,
      author: "Mike Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
      time: "4 hours ago",
      content:
        "Looking for study partners for the upcoming coding bootcamp. Anyone interested?",
      hashtags: ["CodingBootcamp", "StudyGroup"],
      likes: 8,
      comments: 7,
    },
    {
      id: 3,
      author: "Emily Brown",
      avatar: "/placeholder.svg?height=40&width=40",
      time: "1 day ago",
      content:
        "Excited to announce that I'll be speaking at the Tech Conference next month!",
      hashtags: ["PublicSpeaking", "TechConference"],
      likes: 32,
      comments: 12,
    },
    {
      id: 4,
      author: "Alex Turner",
      avatar: "/placeholder.svg?height=40&width=40",
      time: "2 days ago",
      content: "Check out this amazing view from our team building event!",
      hashtags: ["TeamBuilding", "OfficeLife"],
      image: "/placeholder.svg?height=400&width=600&text=Team+Building+Event",
      likes: 45,
      comments: 18,
    },
  ];

  const handleProfileClick = (profile) => {
    setSelectedProfile(profile);
  };

  const closeProfileCard = () => {
    setSelectedProfile(null);
  };

  const handleConnect = async (userId) => {
    try {
      const response = await fetch("/api/connections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ connectedId: userId }),
      });

      if (response.ok) {
        setFeaturedProfiles((prevProfiles) =>
          prevProfiles.map((profile) =>
            profile.id === userId
              ? { ...profile, isConnected: true, isPending: false }
              : profile
          )
        );
      } else {
        console.error("Failed to send connection request");
      }
    } catch (error) {
      console.error("Error sending connection request:", error);
    }
  };

  const handleAcceptConnection = async (userId) => {
    try {
      const response = await fetch(`/api/connections/${userId}/accept`, {
        method: "POST",
      });

      if (response.ok) {
        // Remove the notification
        setNotifications((prevNotifications) =>
          prevNotifications.filter((n) => n.id !== `connection-${userId}`)
        );

        // Optionally update the connections list
        // You might want to refresh the featured profiles here
      }
    } catch (error) {
      console.error("Error accepting connection:", error);
    }
  };

  const handleDeclineConnection = async (userId) => {
    try {
      const response = await fetch(`/api/connections/${userId}/decline`, {
        method: "POST",
      });

      if (response.ok) {
        // Remove the notification
        setNotifications((prevNotifications) =>
          prevNotifications.filter((n) => n.id !== `connection-${userId}`)
        );
      }
    } catch (error) {
      console.error("Error declining connection:", error);
    }
  };

  // Add handler for mentorship notifications
  const handleMentorshipNotification = (applicationId) => {
    // Navigate to mentorship dashboard or specific application
    router.push(`/mentorship/applications/${applicationId}`);
  };

  return (
    <div className="min-h-screen p-6 flex overflow-hidden relative">
      {showProfileAlert && (
        <AlertDialog open={showProfileAlert} onOpenChange={setShowProfileAlert}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Profile Incomplete</AlertDialogTitle>
              <AlertDialogDescription>
                Please complete your profile in the settings to enhance your
                experience.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Close</AlertDialogCancel>
              <AlertDialogAction onClick={() => router.push("/settings")}>
                Go to Settings
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      <div className="flex-grow max-w-3xl mx-auto flex flex-col">
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage
                  src="/placeholder.svg?height=40&width=40"
                  alt={username}
                />
                <AvatarFallback>{username.charAt(0)}</AvatarFallback>
              </Avatar>
              <Input
                placeholder="What's on your mind?"
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                className="flex-grow"
              />
              <Button onClick={handlePost}>
                <Send className="h-4 w-4 mr-2" />
                Post
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mb-4 space-y-6">

          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Recent Activities</h3>
            <Select value={selectedForum} onValueChange={setSelectedForum}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a forum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {subscribedForums && subscribedForums.length > 0 ? (
                  subscribedForums.map((forum) => (
                    <SelectItem key={forum.id} value={forum.id}>
                      {forum.title}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem disabled>No forums subscribed</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <Separator className="my-4" />
        </div>
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-4">Loading posts...</div>
          ) : posts.length === 0 ? (
            <div className="text-center py-4">No posts created yet.</div>
          ) : (
            posts.map((post) => (
            <Card key={post.id} className="p-1">
              <CardHeader className="text-green-500 px-4 py-1">
                    <CardTitle className="text-lg font-bold"> {post.forum.title} </CardTitle>
              </CardHeader>
              <CardContent className="pt-2 pb-2">
                  <div>
                    <h3 className="text-lg font-semibold"> {post.title} </h3>
                    <p className="text-sm font-normal"> {post.content} </p>
                   </div>
                   <div className="flex items-center space-x-1 mt-2 text-xs text-gray-500">
                      <span className="font-light"> Posted By: {post.user.username} </span>
                      <span> - </span>
                      <span className="px-1"> {new Date(post.createdAt).toLocaleString()} </span>
                   </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
      <div className="sticky top-0 w-80 flex-shrink-0">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-500 mb-2">
              Total notifications: {notifications.length}
            </div>

            <ul className="space-y-4">
              {notifications.length === 0 ? (
                <li className="text-center text-gray-500">
                  No new notifications
                </li>
              ) : (
                notifications.map((notification) => (
                  <li
                    key={notification.id}
                    className="flex items-start space-x-3 cursor-pointer hover:bg-gray-100 p-2 rounded-md transition-colors duration-200"
                    onClick={() => {
                      if (notification.type === "connection") {
                        window.location.href = "/user-sphere";
                      } else if (notification.type === "mentorship") {
                        handleMentorshipNotification(
                          notification.applicationData.id
                        );
                      }
                    }}
                  >
                    <div className="p-2 rounded-full bg-gray-200">
                      {notification.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{notification.content}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {notification.time}
                      </p>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Featured Profiles</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingProfiles ? (
              <div className="text-center py-4">
                <div className="loader" />
                Loading profiles...
              </div>
            ) : profileError ? (
              <div className="text-center text-red-500 py-4">
                Oops! Something went wrong while fetching profiles. Please try
                again later.
              </div>
            ) : featuredProfiles.length === 0 ? (
              <div className="text-center py-4">
                No featured profiles available. Consider connecting with others
                to see more profiles!
              </div>
            ) : (
              <ul className="space-y-4">
                {featuredProfiles.map((profile) => (
                  <li
                    key={profile.id}
                    className="flex items-center justify-between"
                  >
                    <div
                      className="flex items-center space-x-2 cursor-pointer"
                      onClick={() => handleProfileClick(profile)}
                    >
                      <Avatar>
                        <AvatarImage src={profile.avatar} alt={profile.name} />
                        <AvatarFallback>{profile.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold hover:underline">
                          {profile.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {profile.institution}
                        </p>
                        <p className="text-xs text-gray-400 truncate max-w-[150px]">
                          {profile.title}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent profile card from opening
                        handleConnect(profile.id);
                        // Add optimistic update for better UX
                        profile.isPending = true;
                      }}
                      disabled={profile.isConnected || profile.isPending}
                      className="transition-all duration-200"
                      title={
                        profile.isConnected
                          ? "Connected"
                          : profile.isPending
                          ? "Request Pending"
                          : "Connect"
                      }
                    >
                      {profile.isConnected ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : profile.isPending ? (
                        <Clock className="h-4 w-4 text-yellow-500 animate-pulse" />
                      ) : (
                        <UserPlus className="h-4 w-4" />
                      )}
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
      {selectedProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-64 relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2"
              onClick={closeProfileCard}
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="h-24 bg-green-600 rounded-t-lg" />
            <img
              src={selectedProfile.avatar}
              height="100"
              width="100"
              className="rounded-full -mt-12 border-4 border-white mx-auto"
              alt="User avatar"
              style={{ aspectRatio: "100/100", objectFit: "cover" }}
            />
            <div className="text-center mt-2">
              <h2 className="text-lg font-semibold">{selectedProfile.name}</h2>
              <p className="text-gray-500">{selectedProfile.title}</p>
            </div>
            <div className="flex justify-center my-4">
              <div className="text-center">
                <h3 className="font-semibold text-lg">
                  {selectedProfile.connections || 0}
                </h3>
                <p className="text-gray-500">Connections</p>
              </div>
            </div>
            <div className="px-6 py-4">
              <Button
                className={`w-full rounded-lg transition-all duration-200 ${
                  selectedProfile.isConnected || selectedProfile.isPending
                    ? "bg-gray-400"
                    : "bg-green-600"
                } text-white`}
                onClick={() => {
                  handleConnect(selectedProfile.id);
                  // Add optimistic update for better UX
                  selectedProfile.isPending = true;
                }}
                disabled={
                  selectedProfile.isConnected || selectedProfile.isPending
                }
              >
                {selectedProfile.isConnected
                  ? "Requested Connection"
                  : selectedProfile.isPending
                  ? "Request Pending"
                  : "Connect"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
