import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Code, Database, Smartphone, Palette, Server, Shield,
  ArrowRight, ArrowLeft, Clock, CheckCircle, Award,
  Rocket, ChevronRight, Target, Zap, Brain, Home
} from "lucide-react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
}

interface DomainConfig {
  label: string;
  icon: typeof Code;
  description: string;
  questions: Question[];
}

const questionBank: Record<string, DomainConfig> = {
  "web-development": {
    label: "Web Development",
    icon: Code,
    description: "HTML, CSS, JavaScript, React & more",
    questions: [
      { question: "What does HTML stand for?", options: ["Hyper Trainer Marking Language", "HyperText Markup Language", "HyperText Marketing Language", "Hyper Tool Multi Language"], correctIndex: 1 },
      { question: "Which CSS property is used to change text color?", options: ["font-color", "text-style", "color", "foreground"], correctIndex: 2 },
      { question: "What is the correct way to declare a variable in JavaScript?", options: ["variable x = 5", "v x = 5", "let x = 5", "dim x = 5"], correctIndex: 2 },
      { question: "What does API stand for?", options: ["Application Programming Interface", "Applied Program Integration", "Application Process Interface", "Automated Programming Interface"], correctIndex: 0 },
      { question: "Which HTTP method is used to retrieve data?", options: ["POST", "PUT", "DELETE", "GET"], correctIndex: 3 },
      { question: "What is React?", options: ["A CSS framework", "A JavaScript library for building UIs", "A database management tool", "A server-side language"], correctIndex: 1 },
      { question: "Which database is a NoSQL database?", options: ["MySQL", "PostgreSQL", "MongoDB", "Oracle"], correctIndex: 2 },
      { question: "What is the purpose of Git?", options: ["Web hosting", "Version control", "Database management", "UI design"], correctIndex: 1 },
      { question: "What does CSS stand for?", options: ["Computer Style Sheets", "Creative Style System", "Cascading Style Sheets", "Colorful Style Sheets"], correctIndex: 2 },
      { question: "Which protocol is used for secure web browsing?", options: ["FTP", "HTTP", "SMTP", "HTTPS"], correctIndex: 3 },
    ],
  },
  "data-science": {
    label: "Data Science",
    icon: Database,
    description: "Python, ML, Statistics & Analytics",
    questions: [
      { question: "Which language is most commonly used in Data Science?", options: ["Java", "C++", "Python", "Ruby"], correctIndex: 2 },
      { question: "What does CSV stand for?", options: ["Computer System Values", "Comma Separated Values", "Central Server Validation", "Common Script Variable"], correctIndex: 1 },
      { question: "Which library is used for data manipulation in Python?", options: ["Django", "Flask", "Pandas", "Tkinter"], correctIndex: 2 },
      { question: "What is a DataFrame?", options: ["A type of database", "A 2D labeled data structure", "An image format", "A web framework"], correctIndex: 1 },
      { question: "What does ML stand for?", options: ["Multi Language", "Machine Learning", "Meta Logic", "Managed Library"], correctIndex: 1 },
      { question: "Which of these is a supervised learning algorithm?", options: ["K-Means", "Linear Regression", "DBSCAN", "PCA"], correctIndex: 1 },
      { question: "What is the purpose of data normalization?", options: ["To delete data", "To scale features to a standard range", "To encrypt data", "To compress files"], correctIndex: 1 },
      { question: "Which visualization library is popular in Python?", options: ["Bootstrap", "Matplotlib", "Express", "Angular"], correctIndex: 1 },
      { question: "What is overfitting?", options: ["Model performs well on all data", "Model is too simple", "Model memorizes training data", "Model runs too fast"], correctIndex: 2 },
      { question: "What does SQL stand for?", options: ["Structured Query Language", "Simple Question Language", "Standard Quality Logic", "System Query Layout"], correctIndex: 0 },
    ],
  },
  "mobile-development": {
    label: "Mobile Development",
    icon: Smartphone,
    description: "React Native, Flutter & Mobile Apps",
    questions: [
      { question: "Which framework is used for cross-platform mobile apps by Facebook?", options: ["Flutter", "React Native", "Xamarin", "Ionic"], correctIndex: 1 },
      { question: "What language does Android primarily use?", options: ["Swift", "Kotlin/Java", "C#", "Python"], correctIndex: 1 },
      { question: "What language does iOS development use?", options: ["Java", "Python", "Swift", "C++"], correctIndex: 2 },
      { question: "What is an APK?", options: ["Android Package Kit", "Apple Program Kit", "App Protocol Key", "Advanced Programming Kit"], correctIndex: 0 },
      { question: "Which tool is used to test mobile UI?", options: ["Postman", "Emulator/Simulator", "Git", "VS Code"], correctIndex: 1 },
      { question: "What is Flutter written in?", options: ["JavaScript", "Dart", "TypeScript", "Go"], correctIndex: 1 },
      { question: "What is a widget in Flutter?", options: ["A database component", "A UI building block", "A testing tool", "A deployment service"], correctIndex: 1 },
      { question: "What store distributes iOS apps?", options: ["Google Play", "App Store", "Microsoft Store", "Amazon Store"], correctIndex: 1 },
      { question: "What does SDK stand for?", options: ["Software Development Kit", "System Design Key", "Standard Data Kit", "Secure Device Kernel"], correctIndex: 0 },
      { question: "What is responsive design?", options: ["Fast loading pages", "Design that adapts to screen sizes", "Colorful design", "3D design"], correctIndex: 1 },
    ],
  },
  "ui-ux-design": {
    label: "UI/UX Design",
    icon: Palette,
    description: "Design thinking, Figma & Prototyping",
    questions: [
      { question: "What does UX stand for?", options: ["User Experience", "Universal Exchange", "Unified Extension", "User Execution"], correctIndex: 0 },
      { question: "What does UI stand for?", options: ["Universal Integration", "User Interface", "Unified Information", "User Interaction"], correctIndex: 1 },
      { question: "Which tool is popular for UI design?", options: ["Excel", "Figma", "Notepad", "Terminal"], correctIndex: 1 },
      { question: "What is a wireframe?", options: ["A type of animation", "A low-fidelity layout sketch", "A database schema", "A network protocol"], correctIndex: 1 },
      { question: "What is a prototype?", options: ["Final product", "Interactive mockup of a design", "A programming language", "A server type"], correctIndex: 1 },
      { question: "What is user persona?", options: ["A login system", "A fictional user representation", "A color scheme", "A font style"], correctIndex: 1 },
      { question: "What is A/B testing in design?", options: ["Testing two designs to compare", "Testing accessibility", "Testing API", "Testing backend"], correctIndex: 0 },
      { question: "What is a design system?", options: ["An operating system", "A collection of reusable design components", "A file format", "A coding standard"], correctIndex: 1 },
      { question: "What does accessibility mean in design?", options: ["Making design fast", "Making design usable by everyone", "Making design colorful", "Making design animated"], correctIndex: 1 },
      { question: "What is information architecture?", options: ["Building architecture", "Organizing content structure", "Network setup", "Database design"], correctIndex: 1 },
    ],
  },
  "devops": {
    label: "DevOps",
    icon: Server,
    description: "CI/CD, Docker, Cloud & Infrastructure",
    questions: [
      { question: "What does CI/CD stand for?", options: ["Computer Integration/Computer Delivery", "Continuous Integration/Continuous Delivery", "Code Inspection/Code Deployment", "Central Index/Central Data"], correctIndex: 1 },
      { question: "What is Docker used for?", options: ["UI design", "Containerization", "Database management", "Email service"], correctIndex: 1 },
      { question: "What is Kubernetes?", options: ["A programming language", "A container orchestration platform", "A database", "A text editor"], correctIndex: 1 },
      { question: "What does AWS stand for?", options: ["Advanced Web Services", "Amazon Web Services", "Automated Work System", "Application Web Stack"], correctIndex: 1 },
      { question: "What is a container?", options: ["A physical server", "A lightweight isolated environment", "A database table", "A CSS property"], correctIndex: 1 },
      { question: "What is Infrastructure as Code?", options: ["Writing CSS", "Managing infrastructure through code", "Building websites", "Creating databases"], correctIndex: 1 },
      { question: "What is a load balancer?", options: ["A weighing machine", "Distributes traffic across servers", "A code compiler", "A testing tool"], correctIndex: 1 },
      { question: "What is monitoring in DevOps?", options: ["Watching videos", "Tracking system health and performance", "Reading documentation", "Writing tests"], correctIndex: 1 },
      { question: "What is a pipeline in CI/CD?", options: ["A water pipe", "Automated workflow for building and deploying", "A data structure", "A network cable"], correctIndex: 1 },
      { question: "What is version control?", options: ["Controlling app versions in store", "Tracking changes in code", "Managing database versions", "Updating OS versions"], correctIndex: 1 },
    ],
  },
  "cybersecurity": {
    label: "Cybersecurity",
    icon: Shield,
    description: "Network security, Encryption & Ethical hacking",
    questions: [
      { question: "What does VPN stand for?", options: ["Virtual Private Network", "Visual Programming Notation", "Verified Public Network", "Virtual Process Node"], correctIndex: 0 },
      { question: "What is phishing?", options: ["A fishing technique", "A fraudulent attempt to steal data", "A programming pattern", "A network protocol"], correctIndex: 1 },
      { question: "What is encryption?", options: ["Deleting data", "Converting data into a coded format", "Compressing files", "Backing up data"], correctIndex: 1 },
      { question: "What is a firewall?", options: ["A physical wall", "A network security system", "A programming language", "A database type"], correctIndex: 1 },
      { question: "What does HTTPS ensure?", options: ["Faster loading", "Secure encrypted communication", "Better SEO", "More storage"], correctIndex: 1 },
      { question: "What is two-factor authentication?", options: ["Using two passwords", "Verifying identity with two methods", "Having two accounts", "Using two browsers"], correctIndex: 1 },
      { question: "What is malware?", options: ["Good software", "Malicious software", "Mobile software", "Marketing software"], correctIndex: 1 },
      { question: "What is SQL injection?", options: ["Adding SQL databases", "Exploiting SQL vulnerabilities", "Writing SQL queries", "Installing SQL server"], correctIndex: 1 },
      { question: "What is a DDoS attack?", options: ["A coding error", "Flooding a server with traffic", "A design pattern", "A testing method"], correctIndex: 1 },
      { question: "What is ethical hacking?", options: ["Illegal hacking", "Authorized testing of security", "Social media hacking", "Gaming hacks"], correctIndex: 1 },
    ],
  },
};

const domains = Object.entries(questionBank).map(([key, val]) => ({
  key,
  ...val,
}));

type Screen = "domain" | "assessment" | "result";

interface AssessmentResult {
  score: number;
  total: number;
  percentage: number;
  level: string;
  role: string;
  assessmentId?: number;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function UdyogAssessment() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [screen, setScreen] = useState<Screen>("domain");
  const [selectedDomain, setSelectedDomain] = useState<string>("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (screen === "assessment") {
      interval = setInterval(() => setElapsedTime((t) => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [screen]);

  useEffect(() => {
    if (result && screen === "result") {
      let current = 0;
      const target = result.percentage;
      const step = Math.max(1, Math.floor(target / 40));
      const interval = setInterval(() => {
        current += step;
        if (current >= target) {
          current = target;
          clearInterval(interval);
        }
        setAnimatedScore(current);
      }, 30);
      return () => clearInterval(interval);
    }
  }, [result, screen]);

  const handleDomainSelect = useCallback((domainKey: string) => {
    setSelectedDomain(domainKey);
    setAnswers(new Array(10).fill(null));
    setCurrentQuestion(0);
    setElapsedTime(0);
    setScreen("assessment");
  }, []);

  const handleOptionSelect = useCallback((optionIndex: number) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[currentQuestion] = optionIndex;
      return next;
    });
  }, [currentQuestion]);

  const handleSubmit = useCallback(async () => {
    const unanswered = answers.filter((a) => a === null).length;
    if (unanswered > 0) {
      toast({
        title: "Incomplete Assessment",
        description: `You have ${unanswered} unanswered question${unanswered > 1 ? "s" : ""}. Please answer all questions.`,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const domain = questionBank[selectedDomain];
      const formattedAnswers = answers.map((selectedIndex, i) => ({
        selected: selectedIndex,
        correct: selectedIndex === domain.questions[i].correctIndex,
      }));
      const res = await apiRequest("POST", "/api/udyog/assess", {
        domain: domain.label,
        answers: formattedAnswers,
      });
      const data = await res.json();
      const clientScore = answers.filter((a, i) => a === domain.questions[i].correctIndex).length;
      const clientPercentage = Math.round((clientScore / 10) * 100);
      const score = data.score ?? clientPercentage;
      let role = "Junior Intern";
      if (score >= 80) role = "Lead Developer";
      else if (score >= 40) role = "Project Associate";
      setResult({
        score: data.assessment?.score ?? clientScore,
        total: 10,
        percentage: score,
        level: data.level ?? data.assessment?.level ?? "Beginner",
        role,
        assessmentId: data.assessment?.id,
      });
      setScreen("result");
    } catch (err: any) {
      const domain = questionBank[selectedDomain];
      const score = answers.filter((a, i) => a === domain.questions[i].correctIndex).length;
      const percentage = Math.round((score / 10) * 100);
      let level = "Beginner";
      let role = "Junior Intern";
      if (percentage >= 80) { level = "Advanced"; role = "Lead Developer"; }
      else if (percentage >= 50) { level = "Intermediate"; role = "Project Associate"; }
      setResult({ score, total: 10, percentage, level, role });
      setScreen("result");
    } finally {
      setIsSubmitting(false);
    }
  }, [answers, selectedDomain, toast]);

  const handleStartInternship = useCallback(async () => {
    if (!result?.assessmentId) {
      toast({ title: "Assessment Not Saved", description: "Your assessment wasn't saved properly. Please retake it.", variant: "destructive" });
      return;
    }
    setIsAssigning(true);
    try {
      await apiRequest("POST", "/api/udyog/assign", { assessmentId: result.assessmentId });
      await queryClient.invalidateQueries({ queryKey: ["/api/udyog/my-assignment"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/udyog/my-batch"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/udyog/assessments"] });
      setLocation("/shishya/udyog/dashboard");
    } catch {
      toast({ title: "Assignment failed", description: "Please try again later.", variant: "destructive" });
    } finally {
      setIsAssigning(false);
    }
  }, [result, setLocation, toast]);

  const questions = selectedDomain ? questionBank[selectedDomain].questions : [];
  const progressPercent = questions.length ? ((currentQuestion + 1) / questions.length) * 100 : 0;

  const levelColors: Record<string, { bg: string; text: string; border: string }> = {
    Beginner: { bg: "rgba(239,68,68,0.15)", text: "#f87171", border: "rgba(239,68,68,0.4)" },
    Intermediate: { bg: "rgba(234,179,8,0.15)", text: "#facc15", border: "rgba(234,179,8,0.4)" },
    Advanced: { bg: "rgba(34,197,94,0.15)", text: "#4ade80", border: "rgba(34,197,94,0.4)" },
  };

  return (
    <div className="min-h-screen relative" style={{ background: "linear-gradient(180deg, #0a0e1a 0%, #111827 100%)" }}>
      <div className="relative z-10 max-w-5xl mx-auto px-4 py-12 md:py-20">
        <AnimatePresence mode="wait">
          {screen === "domain" && (
            <motion.div
              key="domain"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-6">
                <Link href="/shishya/udyog/hub">
                  <Button
                    variant="outline"
                    className="border-white/10 text-gray-300 bg-transparent hover:bg-white/5"
                    data-testid="button-back-hub"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                </Link>
              </div>

              <div className="text-center mb-12">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/30 mb-6" style={{ background: "rgba(34,211,238,0.1)" }}>
                    <Brain className="w-4 h-4 text-cyan-400" />
                    <span className="text-cyan-400 text-sm font-medium">AI Skill Assessment</span>
                  </div>
                </motion.div>
                <h1
                  className="text-3xl md:text-5xl font-bold text-white mb-4"
                  style={{ fontFamily: "var(--font-display)" }}
                  data-testid="text-assessment-title"
                >
                  Choose Your{" "}
                  <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg, #22D3EE, #14B8A6)" }}>
                    Domain
                  </span>
                </h1>
                <p className="text-gray-400 max-w-lg mx-auto" data-testid="text-assessment-subtitle">
                  Select a domain to begin your AI-powered skill assessment. 10 questions to determine your internship level.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {domains.map((domain, index) => {
                  const Icon = domain.icon;
                  return (
                    <motion.button
                      key={domain.key}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.08 }}
                      onClick={() => handleDomainSelect(domain.key)}
                      className="text-left rounded-2xl border border-white/10 p-6 backdrop-blur-xl transition-all duration-300 cursor-pointer group"
                      style={{ background: "rgba(255,255,255,0.03)" }}
                      whileHover={{ borderColor: "rgba(34,211,238,0.4)", boxShadow: "0 0 30px rgba(34,211,238,0.1)" }}
                      data-testid={`card-domain-${domain.key}`}
                    >
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 border border-cyan-500/20 transition-all duration-300 group-hover:border-cyan-500/40"
                        style={{ background: "rgba(34,211,238,0.1)" }}
                      >
                        <Icon className="w-7 h-7 text-cyan-400" />
                      </div>
                      <h3
                        className="text-lg font-semibold text-white mb-1"
                        style={{ fontFamily: "var(--font-display)" }}
                        data-testid={`text-domain-label-${domain.key}`}
                      >
                        {domain.label}
                      </h3>
                      <p className="text-gray-400 text-sm mb-3">{domain.description}</p>
                      <div className="flex items-center gap-1 text-cyan-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Start Assessment <ChevronRight className="w-4 h-4" />
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {screen === "assessment" && questions.length > 0 && (
            <motion.div
              key="assessment"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center border border-cyan-500/20"
                    style={{ background: "rgba(34,211,238,0.1)" }}
                  >
                    {(() => { const Icon = questionBank[selectedDomain].icon; return <Icon className="w-5 h-5 text-cyan-400" />; })()}
                  </div>
                  <div>
                    <h2 className="text-white font-semibold" style={{ fontFamily: "var(--font-display)" }} data-testid="text-current-domain">
                      {questionBank[selectedDomain].label}
                    </h2>
                    <p className="text-gray-500 text-xs">Question {currentQuestion + 1} of {questions.length}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10" style={{ background: "rgba(255,255,255,0.05)" }}>
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span className="text-gray-300 text-sm font-mono" data-testid="text-elapsed-time">{formatTime(elapsedTime)}</span>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-500 text-xs">Progress</span>
                  <span className="text-cyan-400 text-xs font-medium">{Math.round(progressPercent)}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: "linear-gradient(90deg, #22D3EE, #14B8A6)" }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuestion}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-2xl border border-white/10 p-6 md:p-8 backdrop-blur-xl"
                  style={{ background: "rgba(255,255,255,0.03)" }}
                  data-testid="card-question"
                >
                  <div className="flex items-start gap-4 mb-8">
                    <div
                      className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold text-cyan-400 border border-cyan-500/30"
                      style={{ background: "rgba(34,211,238,0.1)" }}
                    >
                      {currentQuestion + 1}
                    </div>
                    <h3 className="text-lg md:text-xl text-white font-medium leading-relaxed" data-testid="text-question">
                      {questions[currentQuestion].question}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {questions[currentQuestion].options.map((option, optIndex) => {
                      const isSelected = answers[currentQuestion] === optIndex;
                      return (
                        <motion.button
                          key={optIndex}
                          onClick={() => handleOptionSelect(optIndex)}
                          className="w-full text-left px-5 py-4 rounded-xl border transition-all duration-200 flex items-center gap-3"
                          style={{
                            background: isSelected ? "rgba(34,211,238,0.1)" : "rgba(255,255,255,0.02)",
                            borderColor: isSelected ? "rgba(34,211,238,0.5)" : "rgba(255,255,255,0.08)",
                          }}
                          whileHover={{ borderColor: "rgba(34,211,238,0.3)" }}
                          data-testid={`option-${optIndex}`}
                        >
                          <div
                            className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold border transition-all duration-200"
                            style={{
                              background: isSelected ? "rgba(34,211,238,0.2)" : "rgba(255,255,255,0.05)",
                              borderColor: isSelected ? "rgba(34,211,238,0.5)" : "rgba(255,255,255,0.1)",
                              color: isSelected ? "#22D3EE" : "#9ca3af",
                            }}
                          >
                            {String.fromCharCode(65 + optIndex)}
                          </div>
                          <span className={`text-sm md:text-base ${isSelected ? "text-cyan-300" : "text-gray-300"}`}>
                            {option}
                          </span>
                          {isSelected && <CheckCircle className="w-5 h-5 text-cyan-400 ml-auto shrink-0" />}
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="flex flex-wrap items-center justify-between gap-3 mt-6">
                <Button
                  variant="outline"
                  className="border-white/10 text-gray-300 bg-transparent"
                  onClick={() => setCurrentQuestion((q) => Math.max(0, q - 1))}
                  disabled={currentQuestion === 0}
                  data-testid="button-previous"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>

                {currentQuestion < questions.length - 1 ? (
                  <Button
                    className="text-white border-0"
                    style={{ background: "linear-gradient(135deg, #22D3EE, #14B8A6)" }}
                    onClick={() => setCurrentQuestion((q) => q + 1)}
                    data-testid="button-next"
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    className="text-white border-0"
                    style={{ background: "linear-gradient(135deg, #22D3EE, #14B8A6)" }}
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    data-testid="button-submit"
                  >
                    {isSubmitting ? "Evaluating..." : "Submit Assessment"}
                    {!isSubmitting && <CheckCircle className="w-4 h-4 ml-2" />}
                  </Button>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mt-6 justify-center">
                {questions.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentQuestion(i)}
                    className="w-8 h-8 rounded-lg text-xs font-medium border transition-all duration-200 flex items-center justify-center"
                    style={{
                      background: i === currentQuestion
                        ? "rgba(34,211,238,0.2)"
                        : answers[i] !== null
                          ? "rgba(34,211,238,0.08)"
                          : "rgba(255,255,255,0.03)",
                      borderColor: i === currentQuestion
                        ? "rgba(34,211,238,0.5)"
                        : answers[i] !== null
                          ? "rgba(34,211,238,0.2)"
                          : "rgba(255,255,255,0.08)",
                      color: i === currentQuestion ? "#22D3EE" : answers[i] !== null ? "#67e8f9" : "#6b7280",
                    }}
                    data-testid={`nav-question-${i}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {screen === "result" && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
              className="max-w-2xl mx-auto"
            >
              <div className="text-center mb-10">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                >
                  <Award className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
                </motion.div>
                <h1
                  className="text-3xl md:text-4xl font-bold text-white mb-2"
                  style={{ fontFamily: "var(--font-display)" }}
                  data-testid="text-result-title"
                >
                  Assessment Complete
                </h1>
                <p className="text-gray-400">Your skill evaluation for {questionBank[selectedDomain]?.label}</p>
              </div>

              <div
                className="rounded-2xl border border-white/10 p-8 md:p-10 backdrop-blur-xl"
                style={{ background: "rgba(255,255,255,0.03)" }}
                data-testid="card-result"
              >
                <div className="flex flex-col items-center mb-8">
                  <div className="relative w-40 h-40 mb-6">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                      <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
                      <motion.circle
                        cx="80" cy="80" r="70" fill="none"
                        stroke="url(#scoreGradient)"
                        strokeWidth="8" strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 70}
                        initial={{ strokeDashoffset: 2 * Math.PI * 70 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 70 * (1 - animatedScore / 100) }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                      />
                      <defs>
                        <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#22D3EE" />
                          <stop offset="100%" stopColor="#14B8A6" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-bold text-white" data-testid="text-score-percentage">{animatedScore}%</span>
                      <span className="text-gray-500 text-xs">{result.score}/{result.total}</span>
                    </div>
                  </div>

                  <div
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border"
                    style={{
                      background: levelColors[result.level]?.bg || levelColors.Beginner.bg,
                      color: levelColors[result.level]?.text || levelColors.Beginner.text,
                      borderColor: levelColors[result.level]?.border || levelColors.Beginner.border,
                    }}
                    data-testid="badge-level"
                  >
                    <Target className="w-4 h-4" />
                    {result.level}
                  </div>
                </div>

                <div
                  className="rounded-xl border border-white/10 p-5 mb-8 text-center"
                  style={{ background: "rgba(34,211,238,0.05)" }}
                  data-testid="card-role-preview"
                >
                  <p className="text-gray-400 text-sm mb-1">Based on your score, you qualify as:</p>
                  <p className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }} data-testid="text-assigned-role">
                    {result.role}
                  </p>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-8 px-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Time: {formatTime(elapsedTime)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    <span>{questionBank[selectedDomain]?.label}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    className="flex-1 text-white border-0"
                    style={{ background: "linear-gradient(135deg, #22D3EE, #14B8A6)" }}
                    onClick={handleStartInternship}
                    disabled={isAssigning}
                    data-testid="button-start-internship"
                  >
                    {isAssigning ? "Assigning..." : "Start Your Internship"}
                    {!isAssigning && <Rocket className="w-4 h-4 ml-2" />}
                  </Button>
                  <Button
                    variant="outline"
                    className="border-white/10 text-gray-300 bg-transparent"
                    onClick={() => {
                      setScreen("domain");
                      setResult(null);
                      setAnimatedScore(0);
                    }}
                    data-testid="button-retake"
                  >
                    Retake Assessment
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
