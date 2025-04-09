"use client";

import React from "react";
import { Mail, MapPin, GraduationCap, Shield, Lock } from "lucide-react";
import { FaLinkedin, FaGithub } from "react-icons/fa6";
import { SiKaggle } from "react-icons/si";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function ProfileContent({ username }) {
  const [profile, setProfile] = React.useState({
    name: "",
    email: "",
    username: "",
    currentInstitution: "",
    location: "",
    bio: "",
    linkedin: "",
    github: "",
    kaggle: "",
    education: [],
    experience: [],
    skills: {
      publications: "",
      research_areas: "",
      technical_skills: "",
    },
    isOwnProfile: false,
  });
  const [error, setError] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);

        if (!username) {
          throw new Error("Username is required");
        }

        const response = await fetch(`/api/profile?username=${username}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch profile");
        }

        setProfile(data);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin">Loading...</div>
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-500">Error: {error}</div>;
  }

  const renderSkills = (skills) => {
    if (!skills) return null;
    return skills
      .split(",")
      .filter((skill) => skill.trim())
      .map((skill, index) => (
        <Badge key={index} variant="secondary">
          {skill.trim()}
        </Badge>
      ));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Present";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="col-span-1 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src="/placeholder.svg" alt={profile.name} />
                  <AvatarFallback>{profile.name?.[0]}</AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-semibold mb-2">{profile.name}</h3>
                {profile.education[0] && (
                  <p className="text-sm text-gray-500 mb-4">
                    {profile.education[0].degree_title}
                  </p>
                )}
                {profile.education[0] && (
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">
                      {profile.education[0].institution}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">{profile.email}</span>
                </div>
                {profile.linkedin && (
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <FaLinkedin className="h-4 w-4" />
                    <a
                      href={`https://www.linkedin.com/in/${profile.linkedin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-500 hover:underline"
                    >
                      View LinkedIn
                    </a>
                  </div>
                )}
                {profile.github && (
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <FaGithub className="h-4 w-4" />
                    <a
                      href={`https://github.com/${profile.github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-500 hover:underline"
                    >
                      View GitHub
                    </a>
                  </div>
                )}
                {profile.kaggle && (
                  <div className="flex items-center justify-center space-x-2">
                    <SiKaggle className="h-4 w-4" />
                    <a
                      href={`https://www.kaggle.com/${profile.kaggle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-500 hover:underline"
                    >
                      View Kaggle
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle>Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {renderSkills(profile.skills.technical_skills)}
              </div>
            </CardContent>
          </Card>
          {/* Research Interests */}
          <Card>
            <CardHeader>
              <CardTitle>Research Interests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Research Areas</h4>
                  <div className="flex flex-wrap gap-2">
                    {renderSkills(profile.skills.research_areas)}
                  </div>
                </div>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2">Publications</h4>
                  <div className="space-y-2">
                    {profile.skills.publications
                      .split("\n")
                      .map((pub, index) => (
                        <p key={index} className="text-sm">
                          {pub}
                        </p>
                      ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="col-span-2 space-y-6">
          {/* Academic Background */}
          <Card>
            <CardHeader>
              <CardTitle>Academic Background</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  {profile.education.map((edu, index) => (
                    <div key={index}>
                      <p className="font-semibold">{edu.degree_title}</p>
                      <p className="text-sm text-gray-500">{edu.institution}</p>
                      <p className="text-sm text-gray-500">
                        {edu.start_year} - {edu.end_year}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional Experience */}
          <Card>
            <CardHeader>
              <CardTitle>Professional Experience</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {profile.experience.map((exp, index) => (
                  <li key={index}>
                    <h4 className="font-semibold">{exp.position_title}</h4>
                    <p className="text-sm text-gray-500">{exp.organization}</p>
                    <p className="text-sm text-gray-500">
                      {formatDate(exp.start_date)} -
                      {exp.end_date ? formatDate(exp.end_date) : "Present"}
                    </p>
                    <ul className="list-disc list-inside mt-2 text-sm">
                      {exp.responsibilities.split("\n").map((resp, idx) => (
                        <li key={idx}>{resp}</li>
                      ))}
                    </ul>
                    {index < profile.experience.length - 1 && (
                      <Separator className="my-4" />
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
