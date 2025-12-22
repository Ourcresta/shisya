import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProgressProvider } from "@/contexts/ProgressContext";
import { TestAttemptProvider } from "@/contexts/TestAttemptContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/auth/ProtectedRoute";
import NotFound from "@/pages/not-found";
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
import CourseLabs from "@/pages/CourseLabs";
import LabPractice from "@/pages/LabPractice";
import Login from "@/auth/Login";
import Signup from "@/auth/Signup";
import VerifyOtp from "@/auth/VerifyOtp";

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

function AuthRedirect({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();
  
  if (isLoading) {
    return null;
  }
  
  if (user) {
    return <Redirect to="/shisya/dashboard" />;
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
      <Route path="/" component={CourseCatalog} />
      <Route path="/courses" component={CourseCatalog} />
      <Route path="/courses/:courseId" component={CourseOverview} />
      <Route path="/verify/:certificateId" component={CertificateVerify} />
      <Route path="/login" component={LoginPage} />
      <Route path="/signup" component={SignupPage} />
      <Route path="/verify-otp" component={VerifyOtp} />
      <Route path="/profile/:username" component={PublicProfilePage} />
      
      {/* Shisya Portal - Login Required */}
      <Route path="/shisya/dashboard" component={ProtectedDashboard} />
      <Route path="/shisya/learn/:courseId" component={ProtectedLearnView} />
      <Route path="/shisya/learn/:courseId/:lessonId" component={ProtectedLessonViewer} />
      <Route path="/shisya/projects/:courseId" component={ProtectedCourseProjects} />
      <Route path="/shisya/projects/:courseId/:projectId" component={ProtectedProjectDetail} />
      <Route path="/shisya/tests/:courseId" component={ProtectedCourseTests} />
      <Route path="/shisya/tests/:courseId/:testId" component={ProtectedTestInstructions} />
      <Route path="/shisya/tests/:courseId/:testId/attempt" component={ProtectedTestAttempt} />
      <Route path="/shisya/tests/:courseId/:testId/result" component={ProtectedTestResult} />
      <Route path="/shisya/labs/:courseId" component={ProtectedCourseLabs} />
      <Route path="/shisya/labs/:courseId/:labId" component={ProtectedLabPractice} />
      <Route path="/shisya/certificates" component={ProtectedCertificatesDashboard} />
      <Route path="/shisya/certificates/:certificateId" component={ProtectedCertificateViewer} />
      <Route path="/shisya/profile" component={ProtectedProfilePage} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <ProgressProvider>
            <TestAttemptProvider>
              <Toaster />
              <Router />
            </TestAttemptProvider>
          </ProgressProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
