import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProgressProvider } from "@/contexts/ProgressContext";
import { TestAttemptProvider } from "@/contexts/TestAttemptContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/auth/ProtectedRoute";
import NotFound from "@/pages/not-found";
import CourseCatalog from "@/pages/CourseCatalog";
import CourseOverview from "@/pages/CourseOverview";
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

function Router() {
  return (
    <Switch>
      {/* Public Routes - No Login Required */}
      <Route path="/" component={CourseCatalog} />
      <Route path="/courses/:courseId" component={CourseOverview} />
      <Route path="/verify/:certificateId" component={CertificateVerify} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/verify-otp" component={VerifyOtp} />
      <Route path="/profile/:username" component={PublicProfilePage} />
      
      {/* Protected Routes - Login Required */}
      <Route path="/courses/:courseId/learn" component={ProtectedLearnView} />
      <Route path="/courses/:courseId/learn/:lessonId" component={ProtectedLessonViewer} />
      <Route path="/courses/:courseId/projects" component={ProtectedCourseProjects} />
      <Route path="/courses/:courseId/projects/:projectId" component={ProtectedProjectDetail} />
      <Route path="/courses/:courseId/tests" component={ProtectedCourseTests} />
      <Route path="/courses/:courseId/tests/:testId" component={ProtectedTestInstructions} />
      <Route path="/courses/:courseId/tests/:testId/attempt" component={ProtectedTestAttempt} />
      <Route path="/courses/:courseId/tests/:testId/result" component={ProtectedTestResult} />
      <Route path="/courses/:courseId/labs" component={ProtectedCourseLabs} />
      <Route path="/courses/:courseId/labs/:labId" component={ProtectedLabPractice} />
      <Route path="/certificates" component={ProtectedCertificatesDashboard} />
      <Route path="/certificates/:certificateId" component={ProtectedCertificateViewer} />
      <Route path="/profile" component={ProtectedProfilePage} />
      
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
