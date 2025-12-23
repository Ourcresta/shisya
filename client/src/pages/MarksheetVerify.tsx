import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  GraduationCap, 
  CheckCircle, 
  XCircle, 
  ArrowLeft,
  Shield,
  Calendar,
  User,
  FileText
} from "lucide-react";

export default function MarksheetVerify() {
  const { marksheetId } = useParams<{ marksheetId: string }>();
  
  const isValid = marksheetId?.startsWith("MS-");
  
  const studentName = marksheetId?.includes("-") 
    ? `Student ${marksheetId.split("-")[2]?.substring(0, 4) || "Unknown"}`
    : "Unknown";
  
  const year = marksheetId?.split("-")[1] || new Date().getFullYear().toString();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit">
            <GraduationCap className="w-8 h-8 text-primary" />
          </div>
          <CardTitle 
            className="text-xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Marksheet Verification
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">OurShiksha Academy</p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="flex items-center justify-center">
            {isValid ? (
              <Badge 
                variant="secondary" 
                className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 px-4 py-2 text-base"
                data-testid="badge-valid"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                VALID DOCUMENT
              </Badge>
            ) : (
              <Badge 
                variant="secondary" 
                className="bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 px-4 py-2 text-base"
                data-testid="badge-invalid"
              >
                <XCircle className="w-5 h-5 mr-2" />
                INVALID DOCUMENT
              </Badge>
            )}
          </div>

          {isValid && (
            <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Document ID</p>
                  <p className="font-medium font-mono" data-testid="text-marksheet-id">{marksheetId}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Student</p>
                  <p className="font-medium" data-testid="text-student-name">{studentName}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Academic Year</p>
                  <p className="font-medium" data-testid="text-academic-year">{year}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Document Type</p>
                  <p className="font-medium">Academic Marksheet</p>
                </div>
              </div>
            </div>
          )}

          {!isValid && (
            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">
                The marksheet ID provided could not be verified. Please check the ID and try again, or contact OurShiksha support.
              </p>
            </div>
          )}

          <div className="text-center text-xs text-muted-foreground">
            <p>This verification was performed on</p>
            <p className="font-medium">{new Date().toLocaleString()}</p>
          </div>

          <div className="flex justify-center">
            <Link href="/">
              <Button variant="outline" className="gap-2" data-testid="button-back-home">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
