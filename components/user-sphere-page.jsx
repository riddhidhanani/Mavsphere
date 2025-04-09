"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MessageCircle,
  UserMinus,
  Check,
  X,
  Loader2,
  Search,
} from "lucide-react";
import LayoutComponent from "@/components/layout-component";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function UserSphere() {
  const router = useRouter();
  const [connections, setConnections] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    const fetchUserSphereData = async () => {
      try {
        const response = await fetch("/api/user-sphere");
        if (response.ok) {
          const data = await response.json();
          setConnections(data.connections);
          setIncomingRequests(data.incomingRequests);
          setSentRequests(data.sentRequests);
        } else {
          console.error("Failed to fetch user sphere data:", response.status);
        }
      } catch (error) {
        console.error("Error fetching user sphere data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserSphereData();
  }, []);

  const ConnectionTable = ({ data, type }) => {
    console.log(
      `Rendering ${type} table with data:`,
      JSON.stringify(data, null, 2)
    );

    if (type === "incoming") {
      data.forEach((item) => {
        const userId = item.user.userId;
        console.log("Incoming user ID:", userId);
      });
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">Avatar</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="hidden md:table-cell">Bio</TableHead>
            <TableHead className="hidden md:table-cell">User ID</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => {
            const user = type === "incoming" ? item.user : item.connected;
            return (
              <TableRow key={item.id}>
                <TableCell>
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={user.avatarUrl}
                      alt={`${user.firstName} ${user.lastName}`}
                    />
                    <AvatarFallback>{user.firstName.charAt(0)}</AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="font-medium">{`${user.firstName} ${user.lastName}`}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {user.profile?.bio || "No bio available"}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {user.id}
                </TableCell>
                <TableCell className="text-right">
                  {type === "connection" && (
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/networking/messaging`)}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive"
                      >
                        <UserMinus className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  )}
                  {type === "incoming" && (
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-500"
                        onClick={() => {
                          console.log("Accept clicked - userId:", user.id);
                          handleAcceptConnection(user.id);
                        }}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive"
                        onClick={() => {
                          console.log("Reject clicked - userId:", user.id);
                          handleRejectConnection(user.id);
                        }}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Decline
                      </Button>
                    </div>
                  )}
                  {type === "sent" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    );
  };

  const handleAcceptConnection = async (connectionId) => {
    try {
      const response = await fetch("/api/user-sphere", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: connectionId,
          connectionId: session.user.id,
          status: "accepted",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to accept connection");
      }

      // Update local state only after successful API call
      const requestToAccept = incomingRequests.find(
        (req) => req.id === connectionId
      );
      if (!requestToAccept) return;

      setConnections((prev) => [...prev, requestToAccept]);
      setIncomingRequests((prev) =>
        prev.filter((req) => req.id !== connectionId)
      );
    } catch (error) {
      console.error("Error accepting connection:", error);
    }
  };

  const handleRejectConnection = async (connectionId) => {
    try {
      const response = await fetch("/api/user-sphere", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: session.user.id,
          connectionId: connectionId,
          status: "rejected",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to reject connection");
      }

      // Update local state after successful API call
      setIncomingRequests((prev) =>
        prev.filter((req) => req.id !== connectionId)
      );
    } catch (error) {
      console.error("Error rejecting connection:", error);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Your Sphere</h1>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <Tabs defaultValue="connections" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="connections" className="text-lg">
              Connections ({connections.length})
            </TabsTrigger>
            <TabsTrigger value="incoming" className="text-lg">
              Incoming ({incomingRequests.length})
            </TabsTrigger>
            <TabsTrigger value="sent" className="text-lg">
              Sent ({sentRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="connections">
            <Card>
              <CardContent className="p-6">
                <ConnectionTable data={connections} type="connection" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="incoming">
            <Card>
              <CardContent className="p-6">
                <ConnectionTable data={incomingRequests} type="incoming" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sent">
            <Card>
              <CardContent className="p-6">
                <ConnectionTable data={sentRequests} type="sent" />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
