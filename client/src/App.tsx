import { lazy, Suspense } from "react";
import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProgressProvider } from "@/contexts/ProgressContext";
import { TestAttemptProvider } from "@/contexts/TestAttemptContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import { CreditProvider } from "@/contexts/CreditContext";
import { UshaProvider } from "@/contexts/UshaContext";
import { ProtectedRoute } from "@/auth/ProtectedRoute";
import { CosmicBackground } from "@/components/CosmicBackground";
import { UshaFloatingWidget } from "@/components/usha";
import NotFound from "@/pages/not-found";

// ── Lazy-loaded pages (code-split per route for faster initial load) ──────────
// Public
const LandingPage       = lazy(() => import("@/pages/LandingPage"));
const Pricing           = lazy(() => import("@/pages/Pricing"));
const About             = lazy(() => import("@/pages/About"));
const Terms             = lazy(() => import("@/pages/Terms"));
const Privacy           = lazy(() => import("@/pages/Privacy"));
const Contact           = lazy(() => import("@/pages/Contact"));
const CourseCatalog     = lazy(() => import("@/pages/CourseCatalog"));
const CourseOverview    = lazy(() => import("@/pages/CourseOverview"));
const CourseGroupPage   = lazy(() => import("@/pages/CourseGroupPage"));
const CertificateVerify      = lazy(() => import("@/pages/CertificateVerify"));
const MarksheetVerify        = lazy(() => import("@/pages/MarksheetVerify"));
const CertVerificationHub    = lazy(() => import("@/pages/CertVerificationHub"));
const PublicProfilePage = lazy(() => import("@/pages/PublicProfilePage"));
const AiUshaMentor      = lazy(() => import("@/pages/AiUshaMentor"));
const BecomeGuru        = lazy(() => import("@/pages/BecomeGuru"));
const HelpCenter        = lazy(() => import("@/pages/HelpCenter"));
const BecomeAPartner    = lazy(() => import("@/pages/BecomeAPartner"));
const UdyogLanding      = lazy(() => import("@/pages/UdyogLanding"));
const UdyogJobs         = lazy(() => import("@/pages/UdyogJobs"));

// Auth
const Login     = lazy(() => import("@/auth/Login"));
const Signup    = lazy(() => import("@/auth/Signup"));
const VerifyOtp = lazy(() => import("@/auth/VerifyOtp"));

// NeonPortfolioPage exports two named components — lazy-load each individually
const _neonModule = () => import("@/pages/NeonPortfolioPage");
const NeonPortfolioPreview = lazy(() => _neonModule().then(m => ({ default: m.NeonPortfolioPreview })));
const PublicNeonPortfolio  = lazy(() => _neonModule().then(m => ({ default: m.PublicNeonPortfolio })));

// Guru admin
const GuruLayout         = lazy(() => import("@/components/guru/GuruLayout"));
const GuruDashboard      = lazy(() => import("@/pages/GuruDashboard"));
const GuruCourses        = lazy(() => import("@/pages/GuruCourses"));
const GuruCourseDetail   = lazy(() => import("@/pages/GuruCourseDetail"));
const GuruStudents       = lazy(() => import("@/pages/GuruStudents"));
const GuruCredits        = lazy(() => import("@/pages/GuruCredits"));
const GuruTests          = lazy(() => import("@/pages/GuruTests"));
const GuruLabs           = lazy(() => import("@/pages/GuruLabs"));
const GuruProjects       = lazy(() => import("@/pages/GuruProjects"));
const GuruSettings       = lazy(() => import("@/pages/GuruSettings"));
const GuruPricing        = lazy(() => import("@/pages/GuruPricing"));
const GuruInternships    = lazy(() => import("@/pages/GuruInternships"));
const GuruJobs           = lazy(() => import("@/pages/GuruJobs"));
const GuruPages          = lazy(() => import("@/pages/GuruPages"));
const GuruUshaKnowledge  = lazy(() => import("@/pages/GuruUshaKnowledge"));
const GuruCdnStatus      = lazy(() => import("@/pages/GuruCdnStatus"));

// Shishya student portal
const Dashboard              = lazy(() => import("@/pages/Dashboard"));
const LearnView              = lazy(() => import("@/pages/LearnView"));
const LessonViewer           = lazy(() => import("@/pages/LessonViewer"));
const CourseProjects         = lazy(() => import("@/pages/CourseProjects"));
const ProjectDetail          = lazy(() => import("@/pages/ProjectDetail"));
const CourseTests            = lazy(() => import("@/pages/CourseTests"));
const TestInstructions       = lazy(() => import("@/pages/TestInstructions"));
const TestAttempt            = lazy(() => import("@/pages/TestAttempt"));
const TestResult             = lazy(() => import("@/pages/TestResult"));
const CertificatesDashboard  = lazy(() => import("@/pages/CertificatesDashboard"));
const CertificateViewer      = lazy(() => import("@/pages/CertificateViewer"));
const PortfolioPreviewPage   = lazy(() => import("@/pages/PortfolioPreviewPage"));
const CourseLabs             = lazy(() => import("@/pages/CourseLabs"));
const LabPractice            = lazy(() => import("@/pages/LabPractice"));
const AllProjectsPage        = lazy(() => import("@/pages/AllProjectsPage"));
const AllTestsPage           = lazy(() => import("@/pages/AllTestsPage"));
const AllLabsPage            = lazy(() => import("@/pages/AllLabsPage"));
const Marksheet              = lazy(() => import("@/pages/Marksheet"));
const Wallet                 = lazy(() => import("@/pages/Wallet"));
const MyLearnings            = lazy(() => import("@/pages/MyLearnings"));
const NeonPortfolioPageFull  = lazy(() => import("@/pages/NeonPortfolioPage").then(m => ({ default: m.NeonPortfolioPreview })));
const UdyogAssessment        = lazy(() => import("@/pages/UdyogAssessment"));
const UdyogDashboard         = lazy(() => import("@/pages/UdyogDashboard"));
const UdyogHub               = lazy(() => import("@/pages/UdyogHub"));

// ── Minimal page-transition loader ───────────────────────────────────────────
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );
}

// ── Protected wrappers ────────────────────────────────────────────────────────
function ProtectedDashboard()          { return <ProtectedRoute><Dashboard /></ProtectedRoute>; }
function ProtectedLearnView()          { return <ProtectedRoute><LearnView /></ProtectedRoute>; }
function ProtectedLessonViewer()       { return <ProtectedRoute><LessonViewer /></ProtectedRoute>; }
function ProtectedCourseProjects()     { return <ProtectedRoute><CourseProjects /></ProtectedRoute>; }
function ProtectedProjectDetail()      { return <ProtectedRoute><ProjectDetail /></ProtectedRoute>; }
function ProtectedCourseTests()        { return <ProtectedRoute><CourseTests /></ProtectedRoute>; }
function ProtectedTestInstructions()   { return <ProtectedRoute><TestInstructions /></ProtectedRoute>; }
function ProtectedTestAttempt()        { return <ProtectedRoute><TestAttempt /></ProtectedRoute>; }
function ProtectedTestResult()         { return <ProtectedRoute><TestResult /></ProtectedRoute>; }
function ProtectedCourseLabs()         { return <ProtectedRoute><CourseLabs /></ProtectedRoute>; }
function ProtectedLabPractice()        { return <ProtectedRoute><LabPractice /></ProtectedRoute>; }
function ProtectedCertificatesDashboard() { return <ProtectedRoute><CertificatesDashboard /></ProtectedRoute>; }
function ProtectedCertificateViewer()  { return <ProtectedRoute><CertificateViewer /></ProtectedRoute>; }
function ProtectedProfilePage()        { return <ProtectedRoute><PortfolioPreviewPage /></ProtectedRoute>; }
function ProtectedAllProjectsPage()    { return <ProtectedRoute><AllProjectsPage /></ProtectedRoute>; }
function ProtectedAllTestsPage()       { return <ProtectedRoute><AllTestsPage /></ProtectedRoute>; }
function ProtectedAllLabsPage()        { return <ProtectedRoute><AllLabsPage /></ProtectedRoute>; }
function ProtectedMarksheet()          { return <ProtectedRoute><Marksheet /></ProtectedRoute>; }
function ProtectedWallet()             { return <ProtectedRoute><Wallet /></ProtectedRoute>; }
function ProtectedMyLearnings()        { return <ProtectedRoute><MyLearnings /></ProtectedRoute>; }
function ProtectedNeonPortfolioPreview() { return <ProtectedRoute><NeonPortfolioPageFull /></ProtectedRoute>; }
function ProtectedUdyogAssessment()    { return <ProtectedRoute><UdyogAssessment /></ProtectedRoute>; }
function ProtectedUdyogDashboard()     { return <ProtectedRoute><UdyogDashboard /></ProtectedRoute>; }
function ProtectedUdyogHub()           { return <ProtectedRoute><UdyogHub /></ProtectedRoute>; }

function GuruPage({ component: Component }: { component: React.ComponentType }) {
  return (
    <Suspense fallback={<PageLoader />}>
      <GuruLayout><Component /></GuruLayout>
    </Suspense>
  );
}

function AuthRedirect({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();
  if (isLoading) return null;
  if (user) return <Redirect to="/shishya/dashboard" />;
  return <>{children}</>;
}

function LoginPage()  { return <AuthRedirect><Login /></AuthRedirect>; }
function SignupPage() { return <AuthRedirect><Signup /></AuthRedirect>; }

function ConditionalCosmicBackground() {
  const [location] = useLocation();
  const { isShishyaRoute } = useTheme();
  const excludedPaths = ["/login", "/signup", "/verify-otp", "/guru/login"];
  const isExcluded = excludedPaths.some(p => location.startsWith(p));
  if (isExcluded || !isShishyaRoute) return null;
  return <CosmicBackground />;
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        {/* Public Routes */}
        <Route path="/" component={LandingPage} />
        <Route path="/pricing" component={Pricing} />
        <Route path="/about" component={About} />
        <Route path="/terms" component={Terms} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/contact" component={Contact} />
        <Route path="/courses" component={CourseCatalog} />
        <Route path="/courses/:courseId" component={CourseOverview} />
        <Route path="/group/:id" component={CourseGroupPage} />
        <Route path="/verify-certificate" component={CertVerificationHub} />
        <Route path="/verify/:certificateId" component={CertificateVerify} />
        <Route path="/verify/marksheet/:marksheetId" component={MarksheetVerify} />
        <Route path="/verify/marksheet/code/:code" component={MarksheetVerify} />
        <Route path="/login" component={LoginPage} />
        <Route path="/signup" component={SignupPage} />
        <Route path="/verify-otp" component={VerifyOtp} />
        <Route path="/profile/:username" component={PublicProfilePage} />
        <Route path="/portfolio/:username" component={PublicProfilePage} />
        <Route path="/neon-portfolio/:username" component={PublicNeonPortfolio} />
        <Route path="/ai-usha-mentor" component={AiUshaMentor} />
        <Route path="/become-guru" component={BecomeGuru} />
        <Route path="/help" component={HelpCenter} />
        <Route path="/become-a-partner" component={BecomeAPartner} />
        <Route path="/shishya/udyog" component={UdyogLanding} />
        <Route path="/shishya/udyog/jobs" component={UdyogJobs} />

        {/* Guru Admin Portal */}
        <Route path="/guru">{() => <Redirect to="/login" />}</Route>
        <Route path="/guru/dashboard"   component={() => <GuruPage component={GuruDashboard} />} />
        <Route path="/guru/courses"     component={() => <GuruPage component={GuruCourses} />} />
        <Route path="/guru/courses/:courseId" component={() => <GuruPage component={GuruCourseDetail} />} />
        <Route path="/guru/students"    component={() => <GuruPage component={GuruStudents} />} />
        <Route path="/guru/credits"     component={() => <GuruPage component={GuruCredits} />} />
        <Route path="/guru/tests"       component={() => <GuruPage component={GuruTests} />} />
        <Route path="/guru/labs"        component={() => <GuruPage component={GuruLabs} />} />
        <Route path="/guru/projects"    component={() => <GuruPage component={GuruProjects} />} />
        <Route path="/guru/pricing"     component={() => <GuruPage component={GuruPricing} />} />
        <Route path="/guru/internships" component={() => <GuruPage component={GuruInternships} />} />
        <Route path="/guru/jobs"        component={() => <GuruPage component={GuruJobs} />} />
        <Route path="/guru/pages"       component={() => <GuruPage component={GuruPages} />} />
        <Route path="/guru/usha-knowledge" component={() => <GuruPage component={GuruUshaKnowledge} />} />
        <Route path="/guru/cdn-status"  component={() => <GuruPage component={GuruCdnStatus} />} />
        <Route path="/guru/settings"    component={() => <GuruPage component={GuruSettings} />} />

        {/* Shishya Portal - Login Required */}
        <Route path="/shishya/dashboard"                          component={ProtectedDashboard} />
        <Route path="/shishya/learn/:courseId"                    component={ProtectedLearnView} />
        <Route path="/shishya/learn/:courseId/:lessonId"          component={ProtectedLessonViewer} />
        <Route path="/shishya/projects"                           component={ProtectedAllProjectsPage} />
        <Route path="/shishya/projects/:courseId"                 component={ProtectedCourseProjects} />
        <Route path="/shishya/projects/:courseId/:projectId"      component={ProtectedProjectDetail} />
        <Route path="/shishya/tests"                              component={ProtectedAllTestsPage} />
        <Route path="/shishya/tests/:courseId"                    component={ProtectedCourseTests} />
        <Route path="/shishya/tests/:courseId/:testId"            component={ProtectedTestInstructions} />
        <Route path="/shishya/tests/:courseId/:testId/attempt"    component={ProtectedTestAttempt} />
        <Route path="/shishya/tests/:courseId/:testId/result"     component={ProtectedTestResult} />
        <Route path="/shishya/labs"                               component={ProtectedAllLabsPage} />
        <Route path="/shishya/labs/:courseId"                     component={ProtectedCourseLabs} />
        <Route path="/shishya/labs/:courseId/:labId"              component={ProtectedLabPractice} />
        <Route path="/shishya/marksheet"                          component={ProtectedMarksheet} />
        <Route path="/shishya/wallet"                             component={ProtectedWallet} />
        <Route path="/shishya/my-learnings"                       component={ProtectedMyLearnings} />
        <Route path="/shishya/certificates"                       component={ProtectedCertificatesDashboard} />
        <Route path="/shishya/certificates/:certificateId"        component={ProtectedCertificateViewer} />
        <Route path="/shishya/profile"                            component={ProtectedProfilePage} />
        <Route path="/shishya/profile/neon-portfolio"             component={ProtectedNeonPortfolioPreview} />
        <Route path="/shishya/udyog/assess"                       component={ProtectedUdyogAssessment} />
        <Route path="/shishya/udyog/hub"                          component={ProtectedUdyogHub} />
        <Route path="/shishya/udyog/dashboard"                    component={ProtectedUdyogDashboard} />

        <Route component={NotFound} />
      </Switch>
    </Suspense>
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
                    <ConditionalCosmicBackground />
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
