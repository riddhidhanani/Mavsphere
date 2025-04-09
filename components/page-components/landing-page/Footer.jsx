import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const Footer = ({
  isDarkMode,
  onServicesClick,
  onAboutUsClick,
  onFAQClick,
  onTermsClick,
}) => {
  return (
    <footer
      className={`mt-12 py-8 ${
        isDarkMode ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      <div className="container mx-auto px-4 flex flex-wrap justify-between">
        {/* Contact information */}
        <div className="w-full md:w-1/4 mb-4 md:mb-0">
          <h3 className="text-lg font-semibold mb-2">Contact Us</h3>
          <p>Email: mavsphere@gmail.com</p>
        </div>
        {/* Quick links */}
        <div className="w-full md:w-1/4 mb-4 md:mb-0">
          <h3 className="text-lg font-semibold mb-2">Quick Links</h3>
          <ul className="space-y-2">
            <li>
              <button
                onClick={onServicesClick}
                className="hover:underline cursor-pointer"
              >
                Services
              </button>
            </li>
            <li>
              <button
                onClick={onAboutUsClick}
                className="hover:underline cursor-pointer"
              >
                About Us
              </button>
            </li>
            <li>
              <button
                onClick={onFAQClick}
                className="hover:underline cursor-pointer"
              >
                FAQ
              </button>
            </li>
          </ul>
        </div>
        {/* Legal information */}
        <div className="w-full md:w-1/4 mb-4 md:mb-0">
          <h3 className="text-lg font-semibold mb-2">Legal</h3>
          <ul>
            <li>
              <button
                onClick={onTermsClick}
                className="hover:underline cursor-pointer"
              >
                Terms & Services
              </button>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
