"use client";

import React, { useState, useEffect } from "react";
import { ChevronRight as MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function MentorshipProgramComponent() {
  const router = useRouter();
  const [isDarkMode] = useState(false);
  const [connections, setConnections] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState({
    title: "",
    description: "",
  });
  const [mentors, setMentors] = useState([]);

  const fetchConnections = async () => {
    try {
      const response = await fetch("/api/user-sphere");
      if (!response.ok) {
        throw new Error("Failed to fetch connections");
      }

      const data = await response.json();
      setConnections(
        data.connections.map((conn) => ({
          name: `${conn.connected.firstName} ${conn.connected.lastName}`,
          title: conn.connected.profile?.bio || "Member",
          avatar:
            conn.connected.profile?.avatarUrl ||
            "/placeholder.svg?height=50&width=50",
          username: conn.connected.username,
          institution: conn.connected.profile?.currentInstitution,
        }))
      );
    } catch (error) {
      console.error("Error fetching connections:", error);
      // Handle error appropriately (e.g., show error message to user)
    }
  };

  const fetchMentors = async () => {
    try {
      const response = await fetch("/api/mentorship/mentors");
      if (response.ok) {
        const data = await response.json();
        setMentors(
          data.map((mentor) => ({
            name: `${mentor.firstName} ${mentor.lastName}`,
            title:
              mentor.profile?.currentInstitution ||
              mentor.mentorProfile?.title ||
              "Mentor",
            avatar:
              mentor.profile?.avatarUrl ||
              "/placeholder.svg?height=50&width=50",
            id: mentor.id,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching mentors:", error);
    }
  };

  useEffect(() => {
    fetchConnections();
    fetchMentors();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);

    const startDate = formData.get("startDate") + "T00:00:00Z";
    const endDate = formData.get("endDate") + "T00:00:00Z";

    const selectedAreas = ["academic", "career", "research"]
      .filter((area) => formData.get(area) === "on")
      .join(", ");

    const data = {
      fullName: formData.get("fullNameMentee"),
      email: formData.get("emailMentee"),
      university: formData.get("university"),
      program: formData.get("program"),
      areasForGuidance: selectedAreas,
      topicOfGuidance: formData.get("topicOfGuidance"),
      meetingFrequency: formData.get("meetingFrequency"),
      startDate: startDate,
      endDate: endDate,
      personalStatement: formData.get("personalStatement"),
    };

    console.log("Submitting data:", data);

    try {
      const response = await fetch("/api/mentorship/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setAlertMessage({
          title: "Success",
          description: "Mentorship application submitted successfully!",
        });
        setShowAlert(true);
        router.refresh();
      } else {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        setAlertMessage({
          title: "Error",
          description: `Error: ${errorText}`,
        });
        setShowAlert(true);
      }
    } catch (error) {
      console.error("Error submitting application:", error);
      setAlertMessage({
        title: "Error",
        description: "Something went wrong. Please try again.",
      });
      setShowAlert(true);
    }
  };

  return (
    <>
      <div
        className={`flex h-screen ${
          isDarkMode ? "bg-gray-900 text-white" : "bg-white text-black"
        }`}
      >
        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {/* Mentorship Program Content */}
          <div className="p-6 flex flex-wrap">
            {/* Left side: Your Mentors and Your Sphere */}
            <div className="w-full lg:w-1/2 pr-3">
              <Card
                className={`mb-6 ${isDarkMode ? "bg-gray-800" : "bg-white"}`}
              >
                <CardHeader>
                  <CardTitle>Your Mentors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4">
                    {mentors.map((mentor, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2">
                          <Avatar>
                            <AvatarImage
                              src={mentor.avatar}
                              alt={mentor.name}
                            />
                            <AvatarFallback>
                              {mentor.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">{mentor.name}</p>
                            <p className="text-sm text-gray-500">
                              {mentor.title}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push("/networking/messaging")}
                        >
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

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
                          onClick={() => router.push("/networking/messaging")}
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

            {/* Right side: Mentorship Program */}
            <div className="w-full lg:w-1/2 pl-3 mt-6 lg:mt-0">
              <Card className={isDarkMode ? "bg-gray-800" : "bg-white"}>
                <CardContent className="pt-6">
                  <Image
                    src="/images/landing_page/undraw_newspaper_re_syf5.svg"
                    alt="Mentorship Program Illustration"
                    width={425}
                    height={200}
                    className="w-1/2 object-cover mb-4 rounded"
                  />
                  <h3 className="text-2xl font-bold mb-4">
                    Mentorship Program
                  </h3>
                  <p className="mb-4">
                    The MavSphere Mentorship Program connects students with
                    experienced professionals and academics to foster growth,
                    learning, and career development. Our program offers
                    personalized guidance, networking opportunities, and
                    invaluable insights into your field of study.
                  </p>
                  <p className="mb-4">
                    Whether you&apos;re seeking academic advice, career
                    guidance, or research support, our mentors are here to help
                    you navigate your academic and professional journey.
                  </p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>Apply Mentorship Program</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>
                          Mentorship Program Application
                        </DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input
                              id="fullName"
                              name="fullNameMentee"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                              id="email"
                              name="emailMentee"
                              type="email"
                              required
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="university">
                              University/Institution
                            </Label>
                            <Input id="university" name="university" required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="program">
                              Current Academic Program
                            </Label>
                            <Input id="program" name="program" required />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Areas for Guidance</Label>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox id="academic" name="academic" />
                              <Label htmlFor="academic">
                                Academic guidance
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="career" name="career" />
                              <Label htmlFor="career">Career advice</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="research" name="research" />
                              <Label htmlFor="research">Research support</Label>
                            </div>
                          </div>
                          <Textarea
                            placeholder="Topic of Guidance"
                            className="mt-2"
                            name="topicOfGuidance"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Preferred Meeting Frequency</Label>
                          <RadioGroup
                            defaultValue="weekly"
                            name="meetingFrequency"
                            required
                          >
                            <div className="flex space-x-2">
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                  value="weekly"
                                  id="weekly"
                                  required
                                />
                                <Label htmlFor="weekly">Weekly</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                  value="biweekly"
                                  id="biweekly"
                                />
                                <Label htmlFor="biweekly">Bi-weekly</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="monthly" id="monthly" />
                                <Label htmlFor="monthly">Monthly</Label>
                              </div>
                            </div>
                          </RadioGroup>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="startDate">Start Date</Label>
                            <Input
                              id="startDate"
                              name="startDate"
                              type="date"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="endDate">End Date</Label>
                            <Input
                              id="endDate"
                              name="endDate"
                              type="date"
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="personalStatement">
                            Personal Statement
                          </Label>
                          <Textarea
                            id="personalStatement"
                            name="personalStatement"
                            placeholder="Why do you want to join the mentorship program?"
                            className="h-24"
                            maxLength={150}
                          />
                          <p className="text-sm text-gray-500">Max 150 words</p>
                        </div>
                        <Button type="submit" className="w-full">
                          Submit Application
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertMessage.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {alertMessage.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowAlert(false)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
