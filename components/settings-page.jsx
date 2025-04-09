"use client";
import React, { useState, useEffect, useRef } from "react";
import { Save, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useSession, signOut } from "next-auth/react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/hooks/use-toast";
import { UserRoundPen, BadgeInfo, GraduationCap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const [isDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // State for user profile data
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    graduationYear: null,
    role: "",
    isMentor: false,
    linkedin: "",
    github: "",
    kaggle: "",
    education: [],
    experience: [],
    skills: {},
  });

  // State for settings
  const [settings, setSettings] = useState({
    email_notifications: false,
    push_notifications: false,
    message_notifications: false,
    profile_visibility: false,
    show_email: false,
    show_linkedin: false,
    show_github: false,
    show_kaggle: false,
  });

  // State for password data
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
  });

  // Add state for password visibility
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // State for mentor preferences
  const [mentorPreferences, setMentorPreferences] = useState({
    academicGuidance: false,
    careerAdvice: false,
    researchSupport: false,
  });

  // Add avatar-related states
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (status !== "authenticated") return;

      try {
        const response = await fetch("/api/settings");
        const data = await response.json();

        if (response.ok) {
          setUserData({
            firstName: data.account?.firstName || "",
            lastName: data.account?.lastName || "",
            email: data.account?.email || "",
            username: data.account?.username || "",
            graduationYear: data.education?.end_year || null,
            isMentor: data.account?.isMentor || false,
            linkedin: data.profile?.linkedin || "",
            github: data.profile?.github || "",
            kaggle: data.profile?.kaggle || "",
            education: data.education || [],
            experience:
              data.experience?.map((exp) => ({
                id: exp.id,
                position_title: exp.position_title,
                organization: exp.organization,
                start_date: exp.start_date,
                end_date: exp.end_date,
                responsibilities: exp.responsibilities,
              })) || [],
            skills: {
              publications: data.skills?.publications || "",
              research_areas: data.skills?.research_areas || "",
              technical_skills: data.skills?.technical_skills || "",
            },
          });
          setAvatarUrl(data.profile?.avatar || "");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast({
          title: "Error",
          description: "Failed to load user data",
          variant: "destructive",
        });
      }
    };

    fetchUserData();
  }, [status, toast]);

  // Fetch initial settings
  useEffect(() => {
    const fetchSettings = async () => {
      if (status !== "authenticated") return;

      try {
        console.log("Fetching settings...");
        const response = await fetch("/api/settings");
        if (!response.ok) {
          throw new Error("Failed to fetch settings");
        }
        const data = await response.json();
        console.log("Received settings:", data);
        setSettings(data);
      } catch (error) {
        console.error("Error fetching settings:", error);
        toast({
          title: "Error",
          description: "Failed to load settings",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [status, toast]);

  // Add to your useEffect that fetches user data
  useEffect(() => {
    const fetchMentorProfile = async () => {
      if (status !== "authenticated" || !userData.isMentor) return;

      try {
        const response = await fetch("/api/settings/mentor");
        if (!response.ok) throw new Error("Failed to fetch mentor profile");

        const data = await response.json();
        setMentorPreferences({
          academicGuidance: data.academicGuidance || false,
          careerAdvice: data.careerAdvice || false,
          researchSupport: data.researchSupport || false,
        });
      } catch (error) {
        console.error("Error fetching mentor profile:", error);
        toast({
          title: "Error",
          description: "Failed to load mentor preferences",
          variant: "destructive",
        });
      }
    };

    fetchMentorProfile();
  }, [status, userData.isMentor, toast]);

  // Handle switch changes
  const handleSettingChange = (setting) => {
    console.log(`Changing setting: ${setting}`);
    console.log("Current value:", settings[setting]);
    setSettings((prev) => {
      const newSettings = {
        ...prev,
        [setting]: !prev[setting],
      };
      console.log("Updated settings:", newSettings);
      return newSettings;
    });
  };

  // Modify handleSave to handle settings separately
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Handle password update first if needed
      if (passwordData.currentPassword && passwordData.newPassword) {
        const passwordResponse = await fetch("/api/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "password",
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword,
          }),
        });

        const passwordResult = await passwordResponse.json();

        if (!passwordResponse.ok) {
          throw new Error(passwordResult.error || "Failed to update password");
        }

        // Clear password fields
        setPasswordData({
          currentPassword: "",
          newPassword: "",
        });

        // If password was changed successfully, sign out the user
        if (passwordResult.requiresReauth) {
          toast({
            title: "Password Updated",
            description: "Please log in again with your new password",
          });
          await signOut();
          return;
        }
      }

      // Handle account information
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "account",
          firstName: userData.firstName,
          lastName: userData.lastName,
          username: userData.username,
        }),
      });

      // Handle education entries separately
      for (const education of userData.education) {
        await fetch("/api/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "education",
            degree_title: education.degree_title,
            institution: education.institution,
            start_year: education.start_year,
            end_year: education.end_year,
            id: education.id, // Include if it's an existing entry
          }),
        });
      }

      // Handle experience entries separately
      for (const experience of userData.experience) {
        await fetch("/api/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "experience",
            position_title: experience.position_title,
            organization: experience.organization,
            start_date: experience.start_date,
            end_date: experience.end_date,
            responsibilities: experience.responsibilities,
            id: experience.id, // Include if it's an existing entry
          }),
        });
      }

      // Update profile links
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "profile",
          linkedin: userData.linkedin,
          github: userData.github,
          kaggle: userData.kaggle,
        }),
      });

      // Update settings
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "settings",
          email_notifications: settings.email_notifications,
          push_notifications: settings.push_notifications,
          message_notifications: settings.message_notifications,
          profile_visibility: settings.profile_visibility,
          show_email: settings.show_email,
          show_linkedin: settings.show_linkedin,
          show_github: settings.show_github,
          show_kaggle: settings.show_kaggle,
        }),
      });

      // Handle skills update
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "skills",
          publications: userData.skills.publications,
          research_areas: userData.skills.research_areas,
          technical_skills: userData.skills.technical_skills,
        }),
      });

      // Save mentor preferences if user is a mentor
      if (userData.isMentor) {
        console.log("Saving mentor preferences:", mentorPreferences);
        const response = await fetch("/api/settings/mentor", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(mentorPreferences),
        });

        if (!response.ok) {
          throw new Error("Failed to save mentor preferences");
        }

        const result = await response.json();
        console.log("Mentor preferences saved:", result);
      }

      toast({
        title: "Success",
        description: "Settings saved successfully",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Update the getStudentStatus function
  const getStudentStatus = () => {
    const currentYear = new Date().getFullYear();

    // Get the latest degree by end_year
    const latestDegree = userData.education.reduce((latest, current) => {
      // If current degree has no end_year, it's not complete, so skip it
      if (!current.end_year) return latest;

      // If no latest degree yet, use current
      if (!latest) return current;

      // Compare end years to find the most recent
      return current.end_year > latest.end_year ? current : latest;
    }, null);

    // If no completed degrees or latest degree's end year is in the future/current
    if (!latestDegree || latestDegree.end_year >= currentYear) {
      return "Student";
    }

    return "Alumni";
  };

  const handleEducationChange = (index, field, value) => {
    const newEducation = [...userData.education];
    newEducation[index] = {
      ...newEducation[index],
      [field]: value,
    };
    setUserData({ ...userData, education: newEducation });
  };

  const handleAddEducation = () => {
    const newEducation = {
      degree_title: "",
      institution: "",
      start_year: new Date().getFullYear(),
      end_year: null,
      temp_id: `temp_${Date.now()}`,
    };
    setUserData((prev) => ({
      ...prev,
      education: [...prev.education, newEducation],
    }));
  };

  const handleDeleteEducation = async (id) => {
    try {
      const response = await fetch(`/api/settings?type=education&id=${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete education");

      setUserData((prev) => ({
        ...prev,
        education: prev.education.filter((edu) => edu.id !== id),
      }));

      toast({
        title: "Success",
        description: "Education entry removed successfully",
      });
    } catch (error) {
      console.error("Error deleting education:", error);
      toast({
        title: "Error",
        description: "Failed to remove education entry",
        variant: "destructive",
      });
    }
  };

  const handleExperienceChange = (index, field, value) => {
    const newExperience = [...userData.experience];
    newExperience[index] = {
      ...newExperience[index],
      [field]: value,
    };
    setUserData({ ...userData, experience: newExperience });
  };

  const handleAddExperience = () => {
    const newExperience = {
      position_title: "",
      organization: "",
      start_date: new Date().toISOString().split("T")[0],
      end_date: null,
      responsibilities: "",
      temp_id: `temp_${Date.now()}`,
    };
    setUserData((prev) => ({
      ...prev,
      experience: [...prev.experience, newExperience],
    }));
  };

  const handleDeleteExperience = async (id) => {
    if (!id) return;

    try {
      const response = await fetch(`/api/settings?type=experience&id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete experience");
      }

      setUserData((prev) => ({
        ...prev,
        experience: prev.experience.filter((exp) => exp.id !== id),
      }));

      toast({
        title: "Success",
        description: "Experience deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting experience:", error);
      toast({
        title: "Error",
        description: "Failed to delete experience",
        variant: "destructive",
      });
    }
  };

  // Add a handler for skills changes
  const handleSkillsChange = (field, value) => {
    setUserData((prev) => ({
      ...prev,
      skills: {
        ...prev.skills,
        [field]: value,
      },
    }));
  };

  // Add this function inside SettingsPage component
  const handleEducationSave = async (educationData) => {
    const { id, ...data } = educationData;

    try {
      const response = await fetch("/api/settings", {
        method: id && id !== "new" ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          id: id !== "new" ? parseInt(id) : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save education");
      }

      return await response.json();
    } catch (error) {
      console.error("Error saving education:", error);
      throw error;
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description:
          "Please upload a valid image file (JPEG, PNG, GIF, or WebP)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingAvatar(true);
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const response = await fetch("/api/settings/avatar", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload avatar");
      }

      const data = await response.json();
      setAvatarUrl(data.avatar);

      toast({
        title: "Success",
        description: "Profile picture updated successfully",
      });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Error",
        description: "Failed to upload profile picture",
        variant: "destructive",
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Loading state
  if (status === "loading" || isLoading) {
    return <SettingsPageSkeleton />;
  }

  // Not authenticated state
  if (status === "unauthenticated") {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="w-96">
          <CardHeader>
            <h2 className="text-lg font-semibold">Access Denied</h2>
          </CardHeader>
          <CardContent>
            <p>Please log in to view and manage your settings.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? "dark" : ""}`}>
      <div className="h-screen bg-background text-foreground">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Profile Information Section */}
          <div className="lg:col-span-2 h-fit">
            <Card className="lg:col-span-2">
              <CardHeader>
                <h2 className="text-xl font-semibold">Profile Information</h2>
              </CardHeader>
              <CardContent className="flex space-x-8">
                <Card className="p-6 flex flex-col items-center space-y-4">
                  <Avatar className="h-56 w-56 mb-4">
                    <AvatarImage
                      src={avatarUrl || "/placeholder.svg?height=160&width=160"}
                      alt={userData.username}
                    />
                    <AvatarFallback className="text-6xl">
                      {userData.username.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleAvatarUpload}
                  />

                  <Button
                    className="justify-center text-base"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                  >
                    {isUploadingAvatar ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <UserRoundPen className="mr-2" />
                        Profile Picture
                      </>
                    )}
                  </Button>
                  <div className="flex flex-row gap-2">
                    <Badge variant="secondary" className="text-base">
                      <BadgeInfo className="h-4 w-4 mr-1" />{" "}
                      {userData.isMentor ? "Mentor" : "Mentee"}
                    </Badge>

                    <Badge variant="secondary" className="text-base">
                      <GraduationCap className="h-4 w-4 mr-1" />{" "}
                      {getStudentStatus()}
                    </Badge>
                  </div>
                </Card>

                <Tabs defaultValue="account" className="w-full">
                  <TabsList
                    className={`grid w-full ${
                      userData.isMentor ? "grid-cols-7" : "grid-cols-6"
                    }`}
                  >
                    <TabsTrigger value="account">Account</TabsTrigger>
                    <TabsTrigger value="password">Password</TabsTrigger>
                    <TabsTrigger value="education">Education</TabsTrigger>
                    <TabsTrigger value="experience">Experience</TabsTrigger>
                    <TabsTrigger value="skills">Skills</TabsTrigger>
                    <TabsTrigger value="links">Profile Links</TabsTrigger>
                    {userData.isMentor && (
                      <TabsTrigger value="mentorship">Mentorship</TabsTrigger>
                    )}
                  </TabsList>
                  <TabsContent value="account">
                    <Card>
                      <CardHeader>
                        <CardTitle>Account</CardTitle>
                        <CardDescription>
                          Make changes to your account here. Click save when
                          you&apos;re done.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="space-y-1">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            value={userData.firstName}
                            onChange={(e) =>
                              setUserData({
                                ...userData,
                                firstName: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            value={userData.lastName}
                            onChange={(e) =>
                              setUserData({
                                ...userData,
                                lastName: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={userData.email}
                            onChange={(e) =>
                              setUserData({
                                ...userData,
                                email: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="username">Username</Label>
                          <Input
                            id="username"
                            value={userData.username}
                            onChange={(e) =>
                              setUserData({
                                ...userData,
                                username: e.target.value,
                              })
                            }
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="password">
                    <Card>
                      <CardHeader>
                        <CardTitle>Password</CardTitle>
                        <CardDescription>
                          Change your password here. After saving, you'll be
                          logged out.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="space-y-1">
                          <Label htmlFor="current">Current password</Label>
                          <div className="relative">
                            <Input
                              id="current"
                              type={showCurrentPassword ? "text" : "password"}
                              value={passwordData.currentPassword}
                              onChange={(e) =>
                                setPasswordData((prev) => ({
                                  ...prev,
                                  currentPassword: e.target.value,
                                }))
                              }
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3"
                              onClick={() =>
                                setShowCurrentPassword(!showCurrentPassword)
                              }
                            >
                              {showCurrentPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="new">New password</Label>
                          <div className="relative">
                            <Input
                              id="new"
                              type={showNewPassword ? "text" : "password"}
                              value={passwordData.newPassword}
                              onChange={(e) =>
                                setPasswordData((prev) => ({
                                  ...prev,
                                  newPassword: e.target.value,
                                }))
                              }
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3"
                              onClick={() =>
                                setShowNewPassword(!showNewPassword)
                              }
                            >
                              {showNewPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="education">
                    <Card>
                      <CardHeader>
                        <CardTitle>Education</CardTitle>
                        <CardDescription>
                          Add your complete educational background.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Degrees</Label>
                          <div className="space-y-4">
                            {userData.education.map((degree, index) => (
                              <div
                                key={degree.id}
                                className="space-y-2 border p-4 rounded-lg"
                              >
                                <Input
                                  placeholder="Degree Title"
                                  value={degree.degree_title}
                                  onChange={(e) =>
                                    handleEducationChange(
                                      index,
                                      "degree_title",
                                      e.target.value
                                    )
                                  }
                                />
                                <Input
                                  placeholder="Institution"
                                  value={degree.institution}
                                  onChange={(e) =>
                                    handleEducationChange(
                                      index,
                                      "institution",
                                      e.target.value
                                    )
                                  }
                                />
                                <div className="grid grid-cols-2 gap-2">
                                  <Input
                                    placeholder="Start Year"
                                    type="number"
                                    value={degree.start_year}
                                    onChange={(e) =>
                                      handleEducationChange(
                                        index,
                                        "start_year",
                                        e.target.value
                                      )
                                    }
                                  />
                                  <Input
                                    placeholder="End Year"
                                    type="number"
                                    value={degree.end_year || ""}
                                    onChange={(e) =>
                                      handleEducationChange(
                                        index,
                                        "end_year",
                                        e.target.value
                                      )
                                    }
                                  />
                                </div>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() =>
                                    handleDeleteEducation(degree.id)
                                  }
                                >
                                  Remove
                                </Button>
                              </div>
                            ))}
                          </div>
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={handleAddEducation}
                          >
                            + Add Another Degree
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="experience">
                    <Card>
                      <CardHeader>
                        <CardTitle>Work Experience</CardTitle>
                        <CardDescription>
                          Add your work experience and internships.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {userData.experience.map((position, index) => (
                            <div
                              key={position.id || position.temp_id}
                              className="space-y-4 p-4 border rounded-lg"
                            >
                              <div className="grid gap-4">
                                <div className="grid gap-2">
                                  <Label htmlFor={`position_title_${index}`}>
                                    Position Title
                                  </Label>
                                  <Input
                                    id={`position_title_${index}`}
                                    value={position.position_title}
                                    onChange={(e) =>
                                      handleExperienceChange(
                                        index,
                                        "position_title",
                                        e.target.value
                                      )
                                    }
                                    placeholder="e.g., Software Engineer"
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor={`organization_${index}`}>
                                    Organization
                                  </Label>
                                  <Input
                                    id={`organization_${index}`}
                                    value={position.organization}
                                    onChange={(e) =>
                                      handleExperienceChange(
                                        index,
                                        "organization",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Company/Organization name"
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="grid gap-2">
                                    <Label htmlFor={`start_date_${index}`}>
                                      Start Date
                                    </Label>
                                    <Input
                                      id={`start_date_${index}`}
                                      type="date"
                                      value={position.start_date}
                                      onChange={(e) =>
                                        handleExperienceChange(
                                          index,
                                          "start_date",
                                          e.target.value
                                        )
                                      }
                                    />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label htmlFor={`end_date_${index}`}>
                                      End Date
                                    </Label>
                                    <Input
                                      id={`end_date_${index}`}
                                      type="date"
                                      value={position.end_date || ""}
                                      onChange={(e) =>
                                        handleExperienceChange(
                                          index,
                                          "end_date",
                                          e.target.value
                                        )
                                      }
                                    />
                                  </div>
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor={`responsibilities_${index}`}>
                                    Responsibilities
                                  </Label>
                                  <Textarea
                                    id={`responsibilities_${index}`}
                                    value={position.responsibilities}
                                    onChange={(e) =>
                                      handleExperienceChange(
                                        index,
                                        "responsibilities",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Describe your responsibilities and achievements"
                                  />
                                </div>
                              </div>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() =>
                                  handleDeleteExperience(position.id)
                                }
                                disabled={!position.id}
                              >
                                Remove
                              </Button>
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={handleAddExperience}
                          >
                            + Add Experience
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="skills">
                    <Card>
                      <CardHeader>
                        <CardTitle>Skills & Expertise</CardTitle>
                        <CardDescription>
                          Share your expertise, research work, and technical
                          skills.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="technical_skills">
                            Technical Skills
                          </Label>
                          <Textarea
                            id="technical_skills"
                            value={userData.skills.technical_skills}
                            onChange={(e) =>
                              handleSkillsChange(
                                "technical_skills",
                                e.target.value
                              )
                            }
                            placeholder="List your technical skills (e.g., Programming languages, tools, frameworks)"
                            className="min-h-[100px]"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="research_areas">Research Areas</Label>
                          <Textarea
                            id="research_areas"
                            value={userData.skills.research_areas}
                            onChange={(e) =>
                              handleSkillsChange(
                                "research_areas",
                                e.target.value
                              )
                            }
                            placeholder="Describe your research interests and areas of expertise"
                            className="min-h-[100px]"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="publications">Publications</Label>
                          <Textarea
                            id="publications"
                            value={userData.skills.publications}
                            onChange={(e) =>
                              handleSkillsChange("publications", e.target.value)
                            }
                            placeholder="List your publications or research work"
                            className="min-h-[100px]"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="links">
                    <Card>
                      <CardHeader>
                        <CardTitle>Profile Links</CardTitle>
                        <CardDescription>
                          Add or update your professional profile links.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="space-y-1">
                          <Label htmlFor="linkedin">LinkedIn Profile</Label>
                          <Input
                            id="linkedin"
                            value={userData.linkedin}
                            onChange={(e) =>
                              setUserData({
                                ...userData,
                                linkedin: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="github">GitHub Profile</Label>
                          <Input
                            id="github"
                            value={userData.github}
                            onChange={(e) =>
                              setUserData({
                                ...userData,
                                github: e.target.value,
                              })
                            }
                            placeholder="Enter your GitHub username"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="kaggle">Kaggle Profile</Label>
                          <Input
                            id="kaggle"
                            value={userData.kaggle}
                            onChange={(e) =>
                              setUserData({
                                ...userData,
                                kaggle: e.target.value,
                              })
                            }
                            placeholder="Enter your Kaggle username"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  {userData.isMentor && (
                    <TabsContent value="mentorship">
                      <Card>
                        <CardHeader>
                          <CardTitle>Mentorship</CardTitle>
                          <CardDescription>
                            Update your mentorship preferences.
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <Label>
                              Areas in which you can provide guidance
                            </Label>
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="academic"
                                  checked={mentorPreferences.academicGuidance}
                                  onCheckedChange={(checked) =>
                                    setMentorPreferences((prev) => ({
                                      ...prev,
                                      academicGuidance: checked,
                                    }))
                                  }
                                />
                                <Label htmlFor="academic">
                                  Academic guidance
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="career"
                                  checked={mentorPreferences.careerAdvice}
                                  onCheckedChange={(checked) =>
                                    setMentorPreferences((prev) => ({
                                      ...prev,
                                      careerAdvice: checked,
                                    }))
                                  }
                                />
                                <Label htmlFor="career">Career advice</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="research"
                                  checked={mentorPreferences.researchSupport}
                                  onCheckedChange={(checked) =>
                                    setMentorPreferences((prev) => ({
                                      ...prev,
                                      researchSupport: checked,
                                    }))
                                  }
                                />
                                <Label htmlFor="research">
                                  Research support
                                </Label>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  )}
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Notification Settings Card */}
          <Card className="h-full">
            <CardHeader>
              <h2 className="text-lg font-semibold">Notification Settings</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="email_notifications" className="text-base">
                  Email Notifications
                </Label>
                <Switch
                  id="email_notifications"
                  checked={settings.email_notifications}
                  onCheckedChange={() =>
                    handleSettingChange("email_notifications")
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="push_notifications" className="text-base">
                  Push Notifications
                </Label>
                <Switch
                  id="push_notifications"
                  checked={settings.push_notifications}
                  onCheckedChange={() =>
                    handleSettingChange("push_notifications")
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="message_notifications" className="text-base">
                  Message Notifications
                </Label>
                <Switch
                  id="message_notifications"
                  checked={settings.message_notifications}
                  onCheckedChange={() =>
                    handleSettingChange("message_notifications")
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Preferences Card */}
          <Card className="h-full">
            <CardHeader>
              <h2 className="text-lg font-semibold">Preferences</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="profile_visibility" className="text-base">
                  Profile Visibility
                </Label>
                <Switch
                  id="profile_visibility"
                  checked={settings.profile_visibility}
                  onCheckedChange={() =>
                    handleSettingChange("profile_visibility")
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="show_email" className="text-base">
                  Show Email to Other Users
                </Label>
                <Switch
                  id="show_email"
                  checked={settings.show_email}
                  onCheckedChange={() => handleSettingChange("show_email")}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="show_linkedin" className="text-base">
                  Show LinkedIn Profile
                </Label>
                <Switch
                  id="show_linkedin"
                  checked={settings.show_linkedin}
                  onCheckedChange={() => handleSettingChange("show_linkedin")}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="show_github" className="text-base">
                  Show GitHub Profile
                </Label>
                <Switch
                  id="show_github"
                  checked={settings.show_github}
                  onCheckedChange={() => handleSettingChange("show_github")}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="show_kaggle" className="text-base">
                  Show Kaggle Profile
                </Label>
                <Switch
                  id="show_kaggle"
                  checked={settings.show_kaggle}
                  onCheckedChange={() => handleSettingChange("show_kaggle")}
                />
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Save Button */}
        <div className="mt-3 flex justify-end">
          <Button
            onClick={handleSave}
            disabled={isSaving || status !== "authenticated"}
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function SettingsPageSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="lg:col-span-2">
        <Skeleton className="h-[400px] w-full" />
      </div>
      <Skeleton className="h-[300px] w-full" />
      <Skeleton className="h-[300px] w-full" />
    </div>
  );
}
