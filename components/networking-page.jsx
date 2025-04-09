"use client";

import React, { useState, useEffect } from "react";
import { MessageSquare, Users, Bell, Send, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSession } from "next-auth/react";
import { CreateGroupDialog } from "./create-group-dialog";

export default function NetworkingPageComponent() {
  const { data: session } = useSession();
  const [selectedChat, setSelectedChat] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [networkingTab, setNetworkingTab] = useState("messaging");
  const [conversations, setConversations] = useState([]);
  const [currentMessages, setCurrentMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [groups, setGroups] = useState([]);
  const [groupMessages, setGroupMessages] = useState([]);
  const [groupSearchQuery, setGroupSearchQuery] = useState("");
  const [newGroupMessage, setNewGroupMessage] = useState("");
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await fetch("/api/networking/conversations");
        if (response.ok) {
          const data = await response.json();
          setConversations(data);
        }
      } catch (error) {
        console.error("Error fetching conversations:", error);
      }
    };

    if (session) {
      fetchConversations();
      // Poll for new conversations every 10 seconds
      const interval = setInterval(fetchConversations, 10000);
      return () => clearInterval(interval);
    }
  }, [session]);

  // Fetch messages for selected conversation
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedChat) return;

      console.log("Fetching messages for chat:", selectedChat);

      try {
        const response = await fetch(
          `/api/networking/conversations/${selectedChat}/messages`
        );
        if (response.ok) {
          const data = await response.json();
          console.log("Fetched messages:", data);
          setCurrentMessages(data);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    if (selectedChat) {
      fetchMessages();
      // Poll for new messages every 3 seconds
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedChat]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    console.log("Sending message:", newMessage);

    try {
      const response = await fetch(
        `/api/networking/conversations/${selectedChat}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content: newMessage }),
        }
      );

      if (response.ok) {
        const message = await response.json();
        console.log("Message sent successfully:", message);
        setCurrentMessages((prev) => [...prev, message]);
        setNewMessage("");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    const participantName = `${conv.participant.firstName} ${conv.participant.lastName}`;
    return participantName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Fetch groups
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch("/api/networking/groups");
        if (response.ok) {
          const data = await response.json();
          setGroups(data);
        }
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
    };

    if (session) {
      fetchGroups();
      const interval = setInterval(fetchGroups, 10000);
      return () => clearInterval(interval);
    }
  }, [session]);

  // Fetch group messages
  useEffect(() => {
    const fetchGroupMessages = async () => {
      if (!selectedGroup) return;

      try {
        const response = await fetch(
          `/api/networking/groups/${selectedGroup}/messages`
        );
        if (response.ok) {
          const data = await response.json();
          setGroupMessages(data);
        }
      } catch (error) {
        console.error("Error fetching group messages:", error);
      }
    };

    if (selectedGroup) {
      fetchGroupMessages();
      const interval = setInterval(fetchGroupMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedGroup]);

  const handleSendGroupMessage = async () => {
    if (!newGroupMessage.trim() || !selectedGroup) return;

    try {
      const response = await fetch(
        `/api/networking/groups/${selectedGroup}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content: newGroupMessage }),
        }
      );

      if (response.ok) {
        const message = await response.json();
        setGroupMessages((prev) => [...prev, message]);
        setNewGroupMessage("");
      }
    } catch (error) {
      console.error("Error sending group message:", error);
    }
  };

  const handleGroupCreated = (newGroup) => {
    // Format the group to match the structure from GET endpoint
    const formattedGroup = {
      id: newGroup.id,
      name: newGroup.name,
      memberCount: newGroup.participants.length,
      participants: newGroup.participants.map((p) => p.user),
      createdAt: newGroup.createdAt,
      updatedAt: newGroup.updatedAt,
    };
    setGroups((prev) => [...prev, formattedGroup]);
  };

  const handleUserSearch = async (query) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `/api/networking/users/search?q=${encodeURIComponent(query)}`
      );
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
      }
    } catch (error) {
      console.error("Error searching users:", error);
    }
    setIsSearching(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="p-6">
        <Tabs
          defaultValue={networkingTab}
          className="w-full"
          onValueChange={(value) => setNetworkingTab(value)}
        >
          <TabsList className="w-full justify-start mb-4">
            <TabsTrigger value="messaging" className="flex-1">
              <MessageSquare className="mr-2 h-4 w-4" />
              Private
            </TabsTrigger>
            <TabsTrigger value="groups" className="flex-1">
              <Users className="mr-2 h-4 w-4" />
              Groups
            </TabsTrigger>
          </TabsList>
          <TabsContent value="messaging" className="border-none p-0">
            <div className="flex h-[calc(100vh-180px)] rounded-lg overflow-hidden shadow-lg">
              {/* Chat List */}
              <div className="w-1/3 border-r border-border bg-card">
                <div className="p-4 bg-muted">
                  <Input
                    type="text"
                    placeholder="Search users"
                    className="w-full bg-background"
                    value={searchQuery}
                    onChange={(e) => handleUserSearch(e.target.value)}
                  />
                  {isSearching && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      Searching...
                    </div>
                  )}
                  {searchResults.length > 0 && (
                    <ScrollArea className="mt-2 max-h-48 rounded-md border bg-background">
                      {searchResults.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center p-2 hover:bg-accent cursor-pointer"
                          onClick={async () => {
                            // Create or get existing conversation
                            try {
                              const response = await fetch(
                                "/api/networking/conversations/new",
                                {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify({
                                    participantId: user.id,
                                  }),
                                }
                              );

                              if (response.ok) {
                                const conversation = await response.json();
                                // Add conversation to list if it's new
                                setConversations((prev) => {
                                  const exists = prev.find(
                                    (conv) => conv.id === conversation.id
                                  );
                                  if (!exists) {
                                    return [...prev, conversation];
                                  }
                                  return prev;
                                });
                                setSelectedChat(conversation.id);
                                setSearchQuery("");
                                setSearchResults([]);
                              }
                            } catch (error) {
                              console.error(
                                "Error creating conversation:",
                                error
                              );
                            }
                          }}
                        >
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarImage
                              src={user.profile?.avatarUrl}
                              alt={`${user.firstName} ${user.lastName}`}
                            />
                            <AvatarFallback>{user.firstName[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{`${user.firstName} ${user.lastName}`}</p>
                            <p className="text-sm text-muted-foreground">
                              @{user.username}
                            </p>
                          </div>
                        </div>
                      ))}
                    </ScrollArea>
                  )}
                </div>
                <ScrollArea className="h-[calc(100vh-240px)]">
                  {filteredConversations.map((conv) => (
                    <div
                      key={conv.id}
                      className={`flex items-center p-3 cursor-pointer hover:bg-accent ${
                        selectedChat === conv.id ? "bg-accent" : ""
                      }`}
                      onClick={() => setSelectedChat(conv.id)}
                    >
                      <Avatar className="h-12 w-12 mr-3">
                        <AvatarImage
                          src={conv.participant.avatarUrl}
                          alt={`${conv.participant.firstName} ${conv.participant.lastName}`}
                        />
                        <AvatarFallback>
                          {conv.participant.firstName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold">
                          {`${conv.participant.firstName} ${conv.participant.lastName}`}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {conv.lastMessage?.content || "No messages yet"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {conv.lastMessage?.createdAt
                            ? new Date(
                                conv.lastMessage.createdAt
                              ).toLocaleTimeString()
                            : ""}
                        </p>
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              </div>

              {/* Chat Window */}
              <div className="flex-1 flex flex-col bg-background">
                {selectedChat ? (
                  <>
                    {/* Chat Header */}
                    <div className="p-4 flex items-center justify-between bg-card">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarImage
                            src={
                              conversations.find((c) => c.id === selectedChat)
                                ?.participant.avatarUrl
                            }
                            alt={
                              conversations.find((c) => c.id === selectedChat)
                                ? `${
                                    conversations.find(
                                      (c) => c.id === selectedChat
                                    ).participant.firstName
                                  } ${
                                    conversations.find(
                                      (c) => c.id === selectedChat
                                    ).participant.lastName
                                  }`
                                : ""
                            }
                          />
                          <AvatarFallback>
                            {conversations
                              .find((c) => c.id === selectedChat)
                              ?.participant.firstName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <h3 className="font-semibold">
                          {conversations.find((c) => c.id === selectedChat)
                            ? `${
                                conversations.find((c) => c.id === selectedChat)
                                  .participant.firstName
                              } ${
                                conversations.find((c) => c.id === selectedChat)
                                  .participant.lastName
                              }`
                            : ""}
                        </h3>
                      </div>
                    </div>

                    {/* Messages */}
                    <ScrollArea className="flex-1 p-4 bg-muted">
                      {currentMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`mb-4 ${
                            message.senderId === session?.user?.id
                              ? "text-right"
                              : "text-left"
                          }`}
                        >
                          <div
                            className={`inline-block p-3 rounded-lg ${
                              message.senderId === session?.user?.id
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-secondary-foreground"
                            }`}
                          >
                            <p>{message.content}</p>
                            <p className="text-xs mt-1 opacity-70">
                              {new Date(message.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </ScrollArea>

                    {/* Message Input */}
                    <div className="p-4 bg-card">
                      <div className="flex items-center">
                        <Input
                          type="text"
                          placeholder="Type a message"
                          className="flex-1 mr-2 bg-background"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              handleSendMessage();
                            }
                          }}
                        />
                        <Button onClick={handleSendMessage}>
                          <Send className="h-4 w-4 mr-2" />
                          Send
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-xl text-muted-foreground">
                      Select a chat to start messaging
                    </p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Add new groups tab content */}
          <TabsContent value="groups" className="border-none p-0">
            <div className="flex h-[calc(100vh-180px)] rounded-lg overflow-hidden shadow-lg">
              {/* Groups List */}
              <div className="w-1/3 border-r border-border bg-card">
                <div className="p-4 bg-muted space-y-2">
                  <Button
                    className="w-full"
                    variant="default"
                    onClick={() => setCreateGroupOpen(true)}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Create New Group
                  </Button>
                  <Input
                    type="text"
                    placeholder="Search groups"
                    className="w-full bg-background"
                    value={groupSearchQuery}
                    onChange={(e) => setGroupSearchQuery(e.target.value)}
                  />
                </div>
                <ScrollArea className="h-[calc(100vh-240px)]">
                  {groups
                    .filter((group) =>
                      group?.name
                        ?.toLowerCase()
                        .includes(groupSearchQuery?.toLowerCase() || "")
                    )
                    .map((group) => (
                      <div
                        key={group.id}
                        className={`flex items-center p-3 cursor-pointer hover:bg-accent ${
                          selectedGroup === group.id ? "bg-accent" : ""
                        }`}
                        onClick={() => setSelectedGroup(group.id)}
                      >
                        <Avatar className="h-12 w-12 mr-3">
                          <AvatarFallback>
                            {group.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-semibold">{group.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {group.memberCount} members
                          </p>
                        </div>
                      </div>
                    ))}
                </ScrollArea>
              </div>

              {/* Group Chat Window */}
              <div className="flex-1 flex flex-col bg-background">
                {selectedGroup ? (
                  <>
                    {/* Group Chat Header */}
                    <div className="p-4 flex items-center justify-between bg-card">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarFallback>
                            {groups
                              .find((g) => g.id === selectedGroup)
                              ?.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">
                            {groups.find((g) => g.id === selectedGroup)?.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {
                              groups.find((g) => g.id === selectedGroup)
                                ?.memberCount
                            }{" "}
                            members
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Group Messages */}
                    <ScrollArea className="flex-1 p-4 bg-muted">
                      {groupMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`mb-4 ${
                            message.senderId === session?.user?.id
                              ? "text-right"
                              : "text-left"
                          }`}
                        >
                          {message.senderId !== session?.user?.id && (
                            <span className="text-xs text-muted-foreground block mb-1">
                              {message.senderName}
                            </span>
                          )}
                          <div
                            className={`inline-block p-3 rounded-lg ${
                              message.senderId === session?.user?.id
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-secondary-foreground"
                            }`}
                          >
                            <p>{message.content}</p>
                            <p className="text-xs mt-1 opacity-70">
                              {new Date(message.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </ScrollArea>

                    {/* Group Message Input */}
                    <div className="p-4 bg-card">
                      <div className="flex items-center">
                        <Input
                          type="text"
                          placeholder="Type a message"
                          className="flex-1 mr-2 bg-background"
                          value={newGroupMessage}
                          onChange={(e) => setNewGroupMessage(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              handleSendGroupMessage();
                            }
                          }}
                        />
                        <Button onClick={handleSendGroupMessage}>
                          <Send className="h-4 w-4 mr-2" />
                          Send
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-xl text-muted-foreground">
                      Select a group to start messaging
                    </p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <CreateGroupDialog
        open={createGroupOpen}
        onOpenChange={setCreateGroupOpen}
        onGroupCreated={handleGroupCreated}
      />
    </div>
  );
}
