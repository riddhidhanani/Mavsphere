"use client";

import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsAndConditions() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">
            Terms and Conditions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[70vh] px-4">
            <div className="space-y-6">
              <section>
                <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
                <p>
                  Welcome to MavSphere. By using our platform, you agree to
                  these terms and conditions. Please read them carefully before
                  using our services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">2. Definitions</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>&quot;Platform&quot; refers to MavSphere</li>
                  <li>
                    &quot;User&quot; refers to students, alumni, mentors, and
                    professionals using the platform
                  </li>
                  <li>
                    &quot;Services&quot; refers to all features and
                    functionalities provided by MavSphere
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">
                  3. User Accounts
                </h2>
                <p className="mb-4">Users must:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    Provide accurate and complete information when creating an
                    account
                  </li>
                  <li>Maintain the security of their account credentials</li>
                  <li>Not share account access with third parties</li>
                  <li>Update account information to ensure accuracy</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">
                  4. Mentorship Program
                </h2>
                <p className="mb-4">
                  Participation in the mentorship program is subject to the
                  following conditions:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    Mentors must provide accurate professional information
                  </li>
                  <li>
                    Mentees must respect mentors&apos; time and commitments
                  </li>
                  <li>Both parties must maintain professional conduct</li>
                  <li>
                    Confidential information shared during mentorship must be
                    protected
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">
                  5. Content Guidelines
                </h2>
                <p className="mb-4">Users must not post content that:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Is false, misleading, or deceptive</li>
                  <li>Infringes on intellectual property rights</li>
                  <li>Contains harmful or malicious code</li>
                  <li>Violates any applicable laws or regulations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">
                  6. Privacy and Data Protection
                </h2>
                <p className="mb-4">
                  We are committed to protecting your privacy. Our data
                  collection and usage practices are outlined in our Privacy
                  Policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">
                  7. Intellectual Property
                </h2>
                <p className="mb-4">
                  All content and materials available on MavSphere, unless
                  otherwise specified, are the property of MavSphere and are
                  protected by applicable intellectual property laws.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">8. Termination</h2>
                <p className="mb-4">
                  We reserve the right to terminate or suspend access to our
                  services for violations of these terms or for any other reason
                  at our discretion.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">
                  9. Changes to Terms
                </h2>
                <p className="mb-4">
                  We may modify these terms at any time. Continued use of the
                  platform after changes constitutes acceptance of the modified
                  terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">
                  10. Contact Information
                </h2>
                <p className="mb-4">
                  For questions about these terms, please contact us at
                  sxg0591@mavs.uta.edu
                </p>
              </section>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
