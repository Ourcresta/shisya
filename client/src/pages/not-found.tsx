import { Link } from "wouter";
import { ArrowLeft, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";

export default function NotFound() {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
          <BookOpen className="w-10 h-10 text-muted-foreground" />
        </div>
        <h1 
          className="text-3xl font-bold mb-2"
          style={{ fontFamily: "var(--font-display)" }}
          data-testid="text-404-title"
        >
          Page Not Found
        </h1>
        <p 
          className="text-muted-foreground max-w-md mb-8"
          data-testid="text-404-message"
        >
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link href="/">
          <Button className="gap-2" data-testid="button-go-home">
            <ArrowLeft className="w-4 h-4" />
            Back to Courses
          </Button>
        </Link>
      </div>
    </Layout>
  );
}
