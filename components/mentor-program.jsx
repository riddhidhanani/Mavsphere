"use client";
import React, { useState, useEffect } from "react";
import { ChevronRight as MessageCircle } from "lucide-react";
import { MessageSquare, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

export default function MentorProgramPage() {
  const router = useRouter();
  const [isDarkMode] = useState(false);
  const [connections, setConnections] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [mentees, setMentees] = useState([]);

  const fetchConnections = async () => {
    try {
      const response = await fetch("/api/user-sphere");
      if (response.ok) {
        const data = await response.json();
        setConnections(
          data.connections.map((conn) => ({
            name: `${conn.connected.firstName} ${conn.connected.lastName}`,
            title: conn.connected.profile?.bio || "Member",
            avatar: "/placeholder.svg?height=50&width=50",
            username: conn.connected.username,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching connections:", error);
    }
  };

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/mentorship/applicants");
      if (response.ok) {
        const data = await response.json();
        setApplicants(data);
      } else {
        console.error("Failed to fetch applicants:", await response.text());
      }
    } catch (error) {
      console.error("Error fetching applicants:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMentees = async () => {
    try {
      const response = await fetch("/api/mentorship/mentees");
      if (response.ok) {
        const data = await response.json();
        setMentees(
          data.map((mentee) => ({
            id: mentee.id,
            name: `${mentee.mentee.firstName} ${mentee.mentee.lastName}`,
            avatar:
              mentee.mentee.profile?.avatarUrl ||
              "/placeholder.svg?height=40&width=40",
            program: mentee.mentee.profile?.currentInstitution || "Member",
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching mentees:", error);
    }
  };

  const handleApplication = async (id, action) => {
    try {
      const response = await fetch(`/api/mentorship/applicants/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        setOpen(false);
        fetchApplicants();
      }
    } catch (error) {
      console.error("Error handling application:", error);
    }
  };

  useEffect(() => {
    fetchConnections();
    fetchApplicants();
    fetchMentees();
  }, []);

  const sphereMembers = [
    {
      id: 1,
      name: "David Brown",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "Professor",
    },
    {
      id: 2,
      name: "Eva Garcia",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "Research Scientist",
    },
    {
      id: 3,
      name: "Frank Lee",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "Industry Expert",
    },
  ];

  const mockApplicants = [
    {
      id: 1,
      name: "John Doe",
      avatar: "/placeholder.svg?height=40&width=40",
      program: "Machine Learning",
    },
    {
      id: 2,
      name: "Jane Smith",
      avatar: "/placeholder.svg?height=40&width=40",
      program: "Robotics",
    },
    {
      id: 3,
      name: "Mike Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
      program: "Computer Vision",
    },
    {
      id: 4,
      name: "Sarah Williams",
      avatar: "/placeholder.svg?height=40&width=40",
      program: "Natural Language Processing",
    },
    {
      id: 5,
      name: "Chris Davis",
      avatar: "/placeholder.svg?height=40&width=40",
      program: "Deep Learning",
    },
    {
      id: 6,
      name: "Emily Brown",
      avatar: "/placeholder.svg?height=40&width=40",
      program: "Data Mining",
    },
  ];

  const handleMessageClick = (username) => {
    router.push(`/networking/messaging`);
  };

  return (
    <div
      className={`flex h-screen ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-white text-black"
      }`}
    >
      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Mentor Program Content */}
        <ScrollArea className="h-[calc(100vh-80px)]">
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Your Mentees */}
              <Card className={isDarkMode ? "bg-gray-800" : "bg-white"}>
                <CardHeader>
                  <CardTitle>Your Mentees</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {mentees.map((mentee) => (
                      <li
                        key={mentee.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage
                              src={mentee.avatar}
                              alt={mentee.name}
                            />
                            <AvatarFallback>
                              {mentee.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{mentee.name}</p>
                            <p className="text-sm text-gray-500">
                              {mentee.program}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMessageClick(mentee.username)}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Message
                        </Button>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Your Sphere */}
              <Card className={isDarkMode ? "bg-gray-800" : "bg-white"}>
                <CardHeader>
                  <CardTitle>Your Sphere</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {connections.slice(0, 6).map((connection, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2">
                          <Avatar>
                            <AvatarImage
                              src={connection.avatar}
                              alt={connection.name}
                            />
                            <AvatarFallback>
                              {connection.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">{connection.name}</p>
                            <p className="text-sm text-gray-500">
                              {connection.title}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleMessageClick(connection.username)
                          }
                        >
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => router.push("/user-sphere")}
                  >
                    See More
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Applicants */}
            <Card className={isDarkMode ? "bg-gray-800" : "bg-white"}>
              <CardHeader>
                <CardTitle>Mentorship Applicants</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {applicants.map((applicant) => (
                    <Dialog
                      key={applicant.id}
                      open={open}
                      onOpenChange={setOpen}
                    >
                      <DialogTrigger asChild>
                        <Card
                          className={`cursor-pointer transition-shadow hover:shadow-md ${
                            isDarkMode
                              ? "bg-gray-700 hover:bg-gray-600"
                              : "bg-white hover:bg-gray-50"
                          }`}
                        >
                          <CardContent className="p-4 flex items-center space-x-4">
                            <Avatar>
                              <AvatarImage
                                src={applicant.avatar}
                                alt={applicant.name}
                              />
                              <AvatarFallback>
                                {applicant.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{applicant.name}</p>
                              <p className="text-sm text-gray-500">
                                {applicant.program}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </DialogTrigger>
                      <DialogContent
                        className={`sm:max-w-[425px] ${
                          isDarkMode ? "bg-gray-800 text-white" : "bg-white"
                        }`}
                      >
                        <DialogHeader>
                          <DialogTitle>Applicant Details</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="flex items-center space-x-4">
                            <Avatar>
                              <AvatarImage
                                src={applicant.avatar}
                                alt={applicant.name}
                              />
                              <AvatarFallback>
                                {applicant.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{applicant.name}</p>
                              <p className="text-sm text-gray-500">
                                {applicant.program}
                              </p>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">
                              Personal Statement
                            </h4>
                            <p className="text-sm">
                              {applicant.personalStatement}
                            </p>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">
                              Areas of Interest
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {applicant.skills &&
                              applicant.skills.length > 0 ? (
                                applicant.skills.map((skill, index) => (
                                  <Badge key={index}>{skill}</Badge>
                                ))
                              ) : (
                                <p className="text-sm text-gray-500">
                                  No skills listed
                                </p>
                              )}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">
                              Preferred Meeting Frequency
                            </h4>
                            <p className="text-sm">Bi-weekly</p>
                          </div>
                          <div className="flex justify-end space-x-2 mt-4">
                            <Button
                              variant="outline"
                              className="bg-red-500 text-white hover:bg-red-600"
                              onClick={() =>
                                handleApplication(applicant.id, "reject")
                              }
                            >
                              <X className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                            <Button
                              className="bg-emerald-500 text-white hover:bg-emerald-600"
                              onClick={() =>
                                handleApplication(applicant.id, "approve")
                              }
                            >
                              <Check className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}
