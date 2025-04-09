import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const FAQ = ({ isOpen, onClose, isDarkMode }) => {
  const faqItems = [
    {
      question: "What is MavSphere?",
      answer:
        "MavSphere is a comprehensive professional networking platform for the UTA community that offers networking, mentorship, career development, and forum discussions. It connects students, alumni, and professionals while providing tools for professional growth.",
    },
    {
      question: "What features does MavSphere offer?",
      answer: `MavSphere includes several key features:
        • Networking: Connect with peers and professionals through direct messaging and group chats
        • Forums: Participate in discussions across various academic and professional topics
        • Career Development: Access resources, articles, and skill-based roadmaps
        • Mentorship Program: Connect with mentors for academic and professional guidance
        • Events: Track and participate in academic and professional events
        • Job Board: Access internship and job opportunities
        • Professional Profile: Showcase your education, experience, and skills`,
    },
    {
      question: "How does the mentorship program work?",
      answer: `The mentorship program offers:
        • Matching with experienced professionals and academics
        • Personalized guidance in academic, career, and research areas
        • Flexible meeting schedules (weekly, bi-weekly, or monthly)
        • Progress tracking and goal setting
        • Direct communication with mentors through the platform`,
    },
    {
      question: "How can I build my professional profile?",
      answer: `You can enhance your profile by:
        • Adding your educational background and academic achievements
        • Listing your professional experiences and responsibilities
        • Showcasing technical skills and research areas
        • Linking professional profiles (LinkedIn, GitHub, Kaggle)
        • Publishing your research work and publications
        • Setting up mentorship preferences`,
    },
    {
      question: "How do the networking features work?",
      answer: `MavSphere's networking features include:
        • Direct messaging with other members
        • Group chat functionality
        • Forum discussions on various topics
        • Connection requests and sphere building
        • Professional event networking
        • Mentor-mentee communications`,
    },
    {
      question: "What career development resources are available?",
      answer: `The platform offers:
        • Skill-based and role-based career roadmaps
        • Professional development articles and guides
        • Job and internship postings
        • Industry-specific forums
        • Networking events and conferences
        • Mentorship opportunities`,
    },
    {
      question: "How do I find and apply for opportunities?",
      answer: `You can find opportunities through:
        • The job board featuring positions from various companies
        • Internship listings for students
        • Event announcements for networking and career fairs
        • Direct connections with professionals in your field
        • Mentor recommendations and referrals`,
    },
    {
      question: "Is MavSphere free to use?",
      answer:
        "Yes, MavSphere is completely free for all UTA students, alumni, and faculty members. All features, including networking, mentorship, and career development resources, are available at no cost.",
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className={`text-2xl ${isDarkMode ? "text-white" : ""}`}>
            Frequently Asked Questions
          </DialogTitle>
        </DialogHeader>
        <Accordion type="single" collapsible className="w-full">
          {faqItems.map((item, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className={isDarkMode ? "text-white" : ""}>
                {item.question}
              </AccordionTrigger>
              <AccordionContent
                className={`whitespace-pre-line ${
                  isDarkMode ? "text-gray-300" : ""
                }`}
              >
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </DialogContent>
    </Dialog>
  );
};

export default FAQ;
