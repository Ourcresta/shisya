import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProgressProvider } from "@/contexts/ProgressContext";
import NotFound from "@/pages/not-found";
import CourseCatalog from "@/pages/CourseCatalog";
import CourseOverview from "@/pages/CourseOverview";
import LearnView from "@/pages/LearnView";
import LessonViewer from "@/pages/LessonViewer";
import CourseProjects from "@/pages/CourseProjects";
import ProjectDetail from "@/pages/ProjectDetail";

function Router() {
  return (
    <Switch>
      <Route path="/" component={CourseCatalog} />
      <Route path="/courses/:courseId" component={CourseOverview} />
      <Route path="/courses/:courseId/learn" component={LearnView} />
      <Route path="/courses/:courseId/learn/:lessonId" component={LessonViewer} />
      <Route path="/courses/:courseId/projects" component={CourseProjects} />
      <Route path="/courses/:courseId/projects/:projectId" component={ProjectDetail} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ProgressProvider>
          <Toaster />
          <Router />
        </ProgressProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
