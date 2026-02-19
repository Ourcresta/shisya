import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProgressProvider } from "@/contexts/ProgressContext";
import { TestAttemptProvider } from "@/contexts/TestAttemptContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { CreditProvider } from "@/contexts/CreditContext";
import { UshaProvider } from "@/contexts/UshaContext";
import { ProtectedRoute } from "@/auth/ProtectedRoute";
import NotFound from "@/pages/not-found";
import GuruLogin from "@/pages/GuruLogin";
import GuruLayout from "@/components/guru/GuruLayout";
import GuruDashboard from "@/pages/GuruDashboard";
import GuruCourses from "@/pages/GuruCourses";
import GuruCourseDetail from "@/pages/GuruCourseDetail";
import GuruStudents from "@/pages/GuruStudents";
import GuruCredits from "@/pages/GuruCredits";
import GuruTests from "@/pages/GuruTests";
import GuruLabs from "@/pages/GuruLabs";
import GuruProjects from "@/pages/GuruProjects";
import GuruSettings from "@/pages/GuruSettings";
import GuruPricing from "@/pages/GuruPricing";
import LandingPage from "@/pages/LandingPage";
import CourseCatalog from "@/pages/CourseCatalog";
import CourseOverview from "@/pages/CourseOverview";
import Dashboard from "@/pages/Dashboard";
import LearnView from "@/pages/LearnView";
import LessonViewer from "@/pages/LessonViewer";
import CourseProjects from "@/pages/CourseProjects";
import ProjectDetail from "@/pages/ProjectDetail";
import CourseTests from "@/pages/CourseTests";
import TestInstructions from "@/pages/TestInstructions";
import TestAttempt from "@/pages/TestAttempt";
import TestResult from "@/pages/TestResult";
import CertificatesDashboard from "@/pages/CertificatesDashboard";
import CertificateViewer from "@/pages/CertificateViewer";
import CertificateVerify from "@/pages/CertificateVerify";
import ProfilePage from "@/pages/ProfilePage";
import PublicProfilePage from "@/pages/PublicProfilePage";
import PortfolioPreviewPage from "@/pages/PortfolioPreviewPage";
import CourseLabs from "@/pages/CourseLabs";
import LabPractice from "@/pages/LabPractice";
import AllProjectsPage from "@/pages/AllProjectsPage";
import AllTestsPage from "@/pages/AllTestsPage";
import AllLabsPage from "@/pages/AllLabsPage";
import Marksheet from "@/pages/Marksheet";
import MarksheetVerify from "@/pages/MarksheetVerify";
import Wallet from "@/pages/Wallet";
import MyLearnings from "@/pages/MyLearnings";
import Pricing from "@/pages/Pricing";
import About from "@/pages/About";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import Contact from "@/pages/Contact";
import Login from "@/auth/Login";
import Signup from "@/auth/Signup";
import VerifyOtp from "@/auth/VerifyOtp";
import { NeonPortfolioPreview, PublicNeonPortfolio } from "@/pages/NeonPortfolioPage";
import { UshaFloatingWidget } from "@/components/usha";

function ProtectedDashboard() {
  return <ProtectedRoute><Dashboard /></ProtectedRoute>;
}

function ProtectedLearnView() {
  return <ProtectedRoute><LearnView /></ProtectedRoute>;
}

function ProtectedLessonViewer() {
  return <ProtectedRoute><LessonViewer /></ProtectedRoute>;
}

function ProtectedCourseProjects() {
  return <ProtectedRoute><CourseProjects /></ProtectedRoute>;
}

function ProtectedProjectDetail() {
  return <ProtectedRoute><ProjectDetail /></ProtectedRoute>;
}

function ProtectedCourseTests() {
  return <ProtectedRoute><CourseTests /></ProtectedRoute>;
}

function ProtectedTestInstructions() {
  return <ProtectedRoute><TestInstructions /></ProtectedRoute>;
}

function ProtectedTestAttempt() {
  return <ProtectedRoute><TestAttempt /></ProtectedRoute>;
}

function ProtectedTestResult() {
  return <ProtectedRoute><TestResult /></ProtectedRoute>;
}

function ProtectedCourseLabs() {
  return <ProtectedRoute><CourseLabs /></ProtectedRoute>;
}

function ProtectedLabPractice() {
  return <ProtectedRoute><LabPractice /></ProtectedRoute>;
}

function ProtectedCertificatesDashboard() {
  return <ProtectedRoute><CertificatesDashboard /></ProtectedRoute>;
}

function ProtectedCertificateViewer() {
  return <ProtectedRoute><CertificateViewer /></ProtectedRoute>;
}

function ProtectedProfilePage() {
  return <ProtectedRoute><ProfilePage /></ProtectedRoute>;
}

function ProtectedPortfolioPreview() {
  return <ProtectedRoute><PortfolioPreviewPage /></ProtectedRoute>;
}

function ProtectedAllProjectsPage() {
  return <ProtectedRoute><AllProjectsPage /></ProtectedRoute>;
}

function ProtectedAllTestsPage() {
  return <ProtectedRoute><AllTestsPage /></ProtectedRoute>;
}

function ProtectedAllLabsPage() {
  return <ProtectedRoute><AllLabsPage /></ProtectedRoute>;
}

function ProtectedMarksheet() {
  return <ProtectedRoute><Marksheet /></ProtectedRoute>;
}

function ProtectedWallet() {
  return <ProtectedRoute><Wallet /></ProtectedRoute>;
}

function ProtectedMyLearnings() {
  return <ProtectedRoute><MyLearnings /></ProtectedRoute>;
}

function ProtectedNeonPortfolioPreview() {
  return <ProtectedRoute><NeonPortfolioPreview /></ProtectedRoute>;
}

function GuruPage({ component: Component }: { component: React.ComponentType }) {
  return <GuruLayout><Component /></GuruLayout>;
}

function AuthRedirect({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();
  
  if (isLoading) {
    return null;
  }
  
  if (user) {
    return <Redirect to="/shishya/dashboard" />;
  }
  
  return <>{children}</>;
}

function LoginPage() {
  return <AuthRedirect><Login /></AuthRedirect>;
}

function SignupPage() {
  return <AuthRedirect><Signup /></AuthRedirect>;
}

function Router() {
  return (
    <Switch>
      {/* Public Routes - No Login Required */}
      <Route path="/" component={LandingPage} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/about" component={About} />
      <Route path="/terms" component={Terms} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/contact" component={Contact} />
      <Route path="/courses" component={CourseCatalog} />
      <Route path="/courses/:courseId" component={CourseOverview} />
      <Route path="/verify/:certificateId" component={CertificateVerify} />
      <Route path="/verify/marksheet/:marksheetId" component={MarksheetVerify} />
      <Route path="/verify/marksheet/code/:code" component={MarksheetVerify} />
      <Route path="/login" component={LoginPage} />
      <Route path="/signup" component={SignupPage} />
      <Route path="/verify-otp" component={VerifyOtp} />
      <Route path="/profile/:username" component={PublicProfilePage} />
      <Route path="/portfolio/:username" component={PublicProfilePage} />
      <Route path="/neon-portfolio/:username" component={PublicNeonPortfolio} />
      
      {/* Guru Admin Portal */}
      <Route path="/guru" component={GuruLogin} />
      <Route path="/guru/dashboard" component={() => <GuruPage component={GuruDashboard} />} />
      <Route path="/guru/courses" component={() => <GuruPage component={GuruCourses} />} />
      <Route path="/guru/courses/:courseId" component={() => <GuruPage component={GuruCourseDetail} />} />
      <Route path="/guru/students" component={() => <GuruPage component={GuruStudents} />} />
      <Route path="/guru/credits" component={() => <GuruPage component={GuruCredits} />} />
      <Route path="/guru/tests" component={() => <GuruPage component={GuruTests} />} />
      <Route path="/guru/labs" component={() => <GuruPage component={GuruLabs} />} />
      <Route path="/guru/projects" component={() => <GuruPage component={GuruProjects} />} />
      <Route path="/guru/pricing" component={() => <GuruPage component={GuruPricing} />} />
      <Route path="/guru/settings" component={() => <GuruPage component={GuruSettings} />} />
      
      {/* Shishya Portal - Login Required */}
      <Route path="/shishya/dashboard" component={ProtectedDashboard} />
      <Route path="/shishya/learn/:courseId" component={ProtectedLearnView} />
      <Route path="/shishya/learn/:courseId/:lessonId" component={ProtectedLessonViewer} />
      <Route path="/shishya/projects" component={ProtectedAllProjectsPage} />
      <Route path="/shishya/projects/:courseId" component={ProtectedCourseProjects} />
      <Route path="/shishya/projects/:courseId/:projectId" component={ProtectedProjectDetail} />
      <Route path="/shishya/tests" component={ProtectedAllTestsPage} />
      <Route path="/shishya/tests/:courseId" component={ProtectedCourseTests} />
      <Route path="/shishya/tests/:courseId/:testId" component={ProtectedTestInstructions} />
      <Route path="/shishya/tests/:courseId/:testId/attempt" component={ProtectedTestAttempt} />
      <Route path="/shishya/tests/:courseId/:testId/result" component={ProtectedTestResult} />
      <Route path="/shishya/labs" component={ProtectedAllLabsPage} />
      <Route path="/shishya/labs/:courseId" component={ProtectedCourseLabs} />
      <Route path="/shishya/labs/:courseId/:labId" component={ProtectedLabPractice} />
      <Route path="/shishya/marksheet" component={ProtectedMarksheet} />
      <Route path="/shishya/wallet" component={ProtectedWallet} />
      <Route path="/shishya/my-learnings" component={ProtectedMyLearnings} />
      <Route path="/shishya/certificates" component={ProtectedCertificatesDashboard} />
      <Route path="/shishya/certificates/:certificateId" component={ProtectedCertificateViewer} />
      <Route path="/shishya/profile" component={ProtectedProfilePage} />
      <Route path="/shishya/profile/portfolio-preview" component={ProtectedPortfolioPreview} />
      <Route path="/shishya/profile/neon-portfolio" component={ProtectedNeonPortfolioPreview} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <AuthProvider>
            <CreditProvider>
              <ProgressProvider>
                <TestAttemptProvider>
                  <UshaProvider>
                    <Toaster />
                    <Router />
                    <UshaFloatingWidget />
                  </UshaProvider>
                </TestAttemptProvider>
              </ProgressProvider>
            </CreditProvider>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
