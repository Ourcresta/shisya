import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader as CardHeaderUI, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Lock, Shield, ArrowLeft } from "lucide-react";

const guruLoginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type GuruLoginInput = z.infer<typeof guruLoginSchema>;

export default function GuruLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<GuruLoginInput>({
    resolver: zodResolver(guruLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: GuruLoginInput) => {
    setIsLoading(true);
    try {
      toast({
        title: "Coming Soon",
        description: "Guru Admin Portal is under development",
      });
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link href="/login">
            <Button variant="ghost" className="gap-2" data-testid="button-back-login">
              <ArrowLeft className="w-4 h-4" />
              Back to Shishya
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeaderUI className="space-y-2 text-center">
            <div className="flex justify-center mb-2">
              <div className="w-14 h-14 rounded-full bg-orange-500/10 flex items-center justify-center">
                <Shield className="w-7 h-7 text-orange-500" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">OurShiksha Guru</CardTitle>
            <CardDescription>
              Admin Control Panel
            </CardDescription>
          </CardHeaderUI>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Admin Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            type="email"
                            placeholder="admin@ourshiksha.com"
                            className="pl-10"
                            data-testid="input-guru-email"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            type="password"
                            placeholder="Enter admin password"
                            className="pl-10"
                            data-testid="input-guru-password"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                  data-testid="button-guru-login"
                >
                  {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Sign In to Guru
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col gap-2 text-center">
            <p className="text-xs text-muted-foreground">
              Authorized administrators only
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
