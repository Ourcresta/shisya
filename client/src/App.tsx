import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProgressProvider } from "@/contexts/ProgressContext";
import { TestAttemptProvider } from "@/contexts/TestAttemptContext";
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

function Router() {
  return (
    <Switch>
      <Route path="/" component={CourseCatalog} />
      <Route path="/courses/:courseId" component={CourseOverview} />
      <Route path="/courses/:courseId/learn" component={LearnView} />
      <Route path="/courses/:courseId/learn/:lessonId" component={LessonViewer} />
      <Route path="/courses/:courseId/projects" component={CourseProjects} />
      <Route path="/courses/:courseId/projects/:projectId" component={ProjectDetail} />
      <Route path="/courses/:courseId/tests" component={CourseTests} />
      <Route path="/courses/:courseId/tests/:testId" component={TestInstructions} />
      <Route path="/courses/:courseId/tests/:testId/attempt" component={TestAttempt} />
      <Route path="/courses/:courseId/tests/:testId/result" component={TestResult} />
      <Route path="/certificates" component={CertificatesDashboard} />
      <Route path="/certificates/:certificateId" component={CertificateViewer} />
      <Route path="/verify/:certificateId" component={CertificateVerify} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/profile/:username" component={PublicProfilePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ProgressProvider>
          <TestAttemptProvider>
            <Toaster />
            <Router />
          </TestAttemptProvider>
        </ProgressProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
