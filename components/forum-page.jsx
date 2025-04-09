"use client";

import { useSession } from "next-auth/react"; // Import useSession from NextAuth
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Card, CardContent } from "./ui/card";
import {
  PlusCircle,
  Send,
  UserRoundPlus,
  UserRoundMinus,
  Eye,
  Users,
  MessageCircle,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Separator } from "./ui/separator";

export default function ForumPage() {
  const { data: session, status } = useSession(); // Get session data from NextAuth
  const [subscribedForums, setSubscribedForums] = useState([]);
  const [unsubscribedForums, setUnsubscribedForums] = useState([]);
  const [selectedForum, setSelectedForum] = useState(null);
  const [forumPosts, setForumPosts] = useState([]);
  const [newPost, setNewPost] = useState({ title: "", content: "" });
  const [forumName, setForumName] = useState("");
  const [forumDescription, setForumDescription] = useState("");
  const [forumRules, setForumRules] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);

  // Set user ID from session
  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      setCurrentUserId(session.user.id);
    }
  }, [session, status]);

  console.log("Logged-in User ID:", currentUserId);

  // Fetch subscribed forums
  useEffect(() => {
    if (!currentUserId) return; // Guard clause to prevent fetching if user ID is not set
    async function fetchSubscribedForums() {
      try {
        console.log("Fetching subscribed forums for user:", currentUserId);
        const response = await fetch(
          `/api/forums/subscribed?userId=${currentUserId}`
        );
        const data = await response.json();
        console.log("Subscribed Forums:", data);
        setSubscribedForums(data);
        if (data.length > 0) {
          setSelectedForum(data[0]); // Set the first forum as the default selected forum
        }
      } catch (error) {
        console.error("Error fetching subscribed forums:", error);
      }
    }
    fetchSubscribedForums();
  }, [currentUserId]);

  // Fetch unsubscribed forums
  useEffect(() => {
    if (!currentUserId) return; // Guard clause to prevent fetching if user ID is not set
    async function fetchUnsubscribedForums() {
      try {
        console.log("Fetching unsubscribed forums for user:", currentUserId);
        const response = await fetch(
          `/api/forums/unsubscribed?userId=${currentUserId}`
        );
        const data = await response.json();
        console.log("Unsubscribed Forums:", data);
        setUnsubscribedForums(data);
      } catch (error) {
        console.error("Error fetching unsubscribed forums:", error);
      }
    }
    fetchUnsubscribedForums();
  }, [currentUserId]);

  // Fetch posts for the selected forum
  useEffect(() => {
    if (!selectedForum) return; // Guard clause to prevent fetching if no forum is selected
    async function fetchForumPosts() {
      try {
        console.log("Fetching posts for forum:", selectedForum.id);
        const response = await fetch(
          `/api/forums/posts?forumId=${selectedForum.id}`
        );
        const data = await response.json();
        setForumPosts(data);
      } catch (error) {
        console.error("Error fetching forum posts:", error);
      }
    }
    fetchForumPosts();
  }, [selectedForum]);

  // Handle new post creation
  const handleCreatePost = async () => {
    if (!newPost.title || !newPost.content) {
      alert("Title and Content are required");
      return;
    }

    try {
      const response = await fetch(
        `/api/forums/posts?forumId=${selectedForum.id}&userId=${currentUserId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: newPost.title,
            content: newPost.content,
            forumId: selectedForum.id,
            userId: currentUserId,
          }),
        }
      );

      if (response.ok) {
        const post = await response.json();
        alert("Forum Post created successfully!");
        setForumPosts((prev) => [...prev, post]); // Add new post to the existing list
        setNewPost({ title: "", content: "" }); // Reset the form

        // Update post count for the select forum
        setSubscribedForums((prev) => {
          return prev.map((forum) => {
            if (forum.id === selectedForum.id) {
              return { ...forum, posts: [...(forum.posts || []), post] }; // Add the new post to the forum's post list and ensure it is an array
            }
            return forum;
          });
        });
      } else {
        alert("Failed to create post");
      }
    } catch (error) {
      console.error("Error creating forum post:", error);
      alert("Failed to create post");
    }
  };

  // Handle subscribe/unsubscribe actions
  const handleForumAction = async (forumId, action) => {
    try {
      const response = await fetch("/api/forums/useraction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUserId, forumId, action }),
      });

      if (response.ok) {
        if (action === "subscribe") {
          const subscribedForum = unsubscribedForums.find(
            (forum) => forum.id === forumId
          );

          // Update the subscribedForums list by adding the new forum
          setSubscribedForums((prev) => {
            const updatedSubscribedForums = [
              ...prev,
              { ...subscribedForum, users: [...subscribedForum.users, {}] },
            ]; // Simulate Add one user

            // Sort the subscribed forums (e.g., alphabetically by title)
            updatedSubscribedForums.sort(
              (a, b) => b.users.length - a.users.length
            ); // Modify this sorting based on your needs

            return updatedSubscribedForums;
          });
          setUnsubscribedForums((prev) =>
            prev.filter((forum) => forum.id !== forumId)
          );
          alert("Forum subscribed successfully!");
        } else {
          const unsubscribedForum = subscribedForums.find(
            (forum) => forum.id === forumId
          );

          // Update the unsubscribedForums list by adding the forum back and updating the user count
          setUnsubscribedForums((prev) => {
            const updatedUnsubscribedForums = [
              ...prev,
              {
                ...unsubscribedForum,
                users: unsubscribedForum.users.slice(0, -1),
              },
            ]; // Simulate Remove one user

            // Sort the unsubscribed forums by the number of users, in descending order
            updatedUnsubscribedForums.sort(
              (a, b) => b.users.length - a.users.length
            ); // Sort by user count, descending

            return updatedUnsubscribedForums;
          });
          setSubscribedForums((prev) =>
            prev.filter((forum) => forum.id !== forumId)
          );
          alert("Forum unsubscribed successfully!");
        }
      } else {
        alert(`Failed to ${action} forum`);
      }
    } catch (error) {
      console.error(`Error during forum ${action}:`, error);
    }
  };

  // Handle forum creation
  const handleCreateForum = async () => {
    if (!forumName) {
      alert("Forum name is required");
      return;
    }

    try {
      const response = await fetch("/api/forums", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: forumName,
          description: forumDescription,
          rules: forumRules,
          userId: currentUserId,
        }),
      });

      if (response.ok) {
        const newForum = await response.json();
        setSubscribedForums((prev) => [...prev, newForum]);
        setForumName("");
        setForumDescription("");
        setForumRules("");
        alert("Forum created successfully!");
      } else {
        alert("Error creating forum");
      }
    } catch (error) {
      console.error("Error creating forum:", error);
      alert("Failed to create forum");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 w-full px-4 py-8 flex">
        {/* --------------------Left Section: Subscribed Forums --------------------------------*/}

        <aside className="flex-[2.5] pr-4">
          <h2 className="text-xl font-semibold mb-4">Subscribed Forums</h2>
          <div className="space-y-4">
            {/* Check if there are any subscribed forums */}
            {subscribedForums.length === 0 ? (
              // Display a message when there are no subscribed forums
              <div className="text-gray-500 text-left py-4">
                <p>You have no subscribed forums yet.</p>
              </div>
            ) : (
              // Render subscribed forums when available
              subscribedForums.map((forum) => (
                <Card
                  key={forum.id}
                  className="cursor-pointer hover:bg-accent transition-transform hover:scale-[1.02] shadow-sm hover:shadow-md"
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col space-y-2">
                      {/* Forum Title and Subscriber Count */}
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">{forum.title}</h3>
                        {/* Users Icon and subscriber count */}
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <Users className="h-4 w-4" />
                          <span>{forum.users?.length || 0}</span>
                        </div>
                        {/* MessageCircle Icon and posts count */}
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <MessageCircle className="h-4 w-4" />
                          <span>{forum.posts?.length || 0}</span>{" "}
                          {/* Number of posts */}
                        </div>
                      </div>
                      <div className="flex items-center mb-2 justify-between">
                        <h3 className="space-x-1 text-sm text-gray-500">
                          {forum.description}
                        </h3>
                      </div>
                      {/* Buttons - Subscribe and View Posts */}
                      <div className="flex space-x-2">
                        {/* Unsubscribe Button */}
                        <Button
                          onClick={() =>
                            handleForumAction(forum.id, "unsubscribe")
                          }
                          className="flex items-center space-x-2 py-1 px-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-500 transition-colors text-sm"
                        >
                          <UserRoundMinus className="mr-2 h-4 w-4" />{" "}
                          Unsubscribe
                        </Button>

                        {/* View Posts Button */}
                        <Button
                          onClick={() => setSelectedForum(forum)}
                          className="flex items-center space-x-2 py-1 px-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-500 transition-colors text-sm"
                        >
                          {" "}
                          <Eye className="mr-2 h-4 w-4" /> View Posts
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </aside>

        <Separator orientation="vertical" className="mx-4" />

        {/* ---------------------Middle Section: Forum Posts -----------------------------*/}

        <div className="flex-[4.5]">
          <h2 className="text-xl font-semibold mb-4">
            {selectedForum
              ? `Forum Posts: "${selectedForum.title}"`
              : "Forum Posts: "}
          </h2>
          <div>
            {selectedForum ? (
              <>
                {/* Post Creation Form Container */}
                <div className="p-4 rounded-lg border border-muted shadow-md hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-center space-x-2 mb-3">
                    {/* Post Title Input */}
                    <Input
                      value={newPost.title}
                      onChange={(e) =>
                        setNewPost({ ...newPost, title: e.target.value })
                      }
                      placeholder="Post Title"
                      className="flex-1 rounded-lg p-2 border border-green-300 focus:ring-green-500 focus:ring-2 shadow-sm hover:shadow-md transition-shadow duration-200"
                    />
                    {/* Post Button Beside Title */}
                    <Button
                      onClick={handleCreatePost}
                      className="py-2 px-4 text-sm bg-green-500 text-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex items-center space-x-2"
                    >
                      {" "}
                      <Send className="mr-2 h-4 w-4" /> Post
                    </Button>
                  </div>
                  {/* Post Content Input */}
                  <Textarea
                    value={newPost.content}
                    onChange={(e) =>
                      setNewPost({ ...newPost, content: e.target.value })
                    }
                    placeholder="Post Content"
                    className="w-full rounded-lg p-2 border border-green-300 focus:ring-green-500 focus:ring-2 shadow-sm hover:shadow-md transition-shadow duration-200"
                  />
                </div>

                {/* List of Forum Posts */}
                <div className="space-y-4 mt-6">
                  {forumPosts.length === 0 ? (
                    <div className="text-center text-sm text-gray-500">
                      No posts created in the forum yet. Create one using the
                      above box.
                    </div>
                  ) : (
                    forumPosts.map((post) => (
                      <Card
                        key={post.id}
                        className="shadow-sm hover:shadow-md transition-shadow duration-200"
                      >
                        <CardContent className="flex flex-col justify-center p-4">
                          <h3 className="text-xl font-bold">{post.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {post.content}
                          </p>
                          {/* Display the user's information */}
                          <div className="flex items-center space-x-2 mt-4 text-sm text-gray-600">
                            <span className="font-semibold">
                              {post.user.username}
                            </span>{" "}
                            {/* Display username */}
                            <span> - </span> {/* Separator */}
                            <span>
                              {new Date(post.createdAt).toLocaleString()}
                            </span>{" "}
                            {/* Format the createdAt date */}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </>
            ) : (
              <div className="text-gray-500 text-left py-4">
                <p>Please select a subscribed forum to view posts.</p>
              </div>
            )}
          </div>
        </div>

        <Separator orientation="vertical" className="mx-5" />

        {/* -------------------------Right Section: Unsubscribed Forums ----------------------------------*/}

        <aside className="flex-[2.5] pl-4">
          <h2 className="text-xl font-semibold mb-4">Popular Forums</h2>
          <div className="space-y-4">
            {unsubscribedForums.map((forum) => (
              <Card
                key={forum.id}
                className="cursor-pointer hover:bg-accent transition-transform hover:scale-[1.02] shadow-sm hover:shadow-md"
              >
                <CardContent className="p-4">
                  <div className="flex flex-col">
                    {/* Forum Title and Subscriber Count */}
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold">{forum.title}</h3>
                      {/* Users Icon and subscriber count */}
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Users className="h-4 w-4" />
                        <span>{forum.users?.length || 0}</span>
                      </div>
                      {/* MessageCircle Icon and posts count */}
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <MessageCircle className="h-4 w-4" />
                        <span>{forum.posts?.length || 0}</span>{" "}
                        {/* Number of posts */}
                      </div>
                    </div>
                    <div className="flex items-center mb-2 justify-between">
                      <h3 className="space-x-1 text-sm text-gray-500">
                        {forum.description}
                      </h3>
                    </div>
                    {/* Subscribe Button */}
                    <div className="flex space-x-2 justify-start">
                      <Button
                        onClick={() => handleForumAction(forum.id, "subscribe")}
                        className="flex items-center w-auto space-x-2 py-1 px-8 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-500 transition-colors"
                      >
                        <UserRoundPlus className="mr-2 h-4 w-4" /> Subscribe
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </aside>
      </main>

      {/* --------------------Create Forum Button -------------------------- */}

      <Sheet>
        <SheetTrigger asChild>
          <Button className="fixed bottom-8 right-8 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 hover:scale-105 transition-all">
            <PlusCircle className="mr-2 h-4 w-4" /> Create New
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Create a New Forum</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 mt-4">
            <Input
              value={forumName}
              onChange={(e) => setForumName(e.target.value)}
              placeholder="Forum Name"
            />
            <Textarea
              value={forumDescription}
              onChange={(e) => setForumDescription(e.target.value)}
              placeholder="Forum Description"
            />
            <Input
              value={forumRules}
              onChange={(e) => setForumRules(e.target.value)}
              placeholder="Forum Rules"
            />
            <Button onClick={handleCreateForum} className="w-full">
              Create Forum
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
