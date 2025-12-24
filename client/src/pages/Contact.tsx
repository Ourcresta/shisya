import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { 
  GraduationCap, 
  Mail, 
  MapPin, 
  Send, 
  MessageSquare,
  CheckCircle2
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Header } from "@/components/layout/Header";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

function Footer() {
  return (
    <footer className="border-t py-8 bg-background">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="w-4 h-4" />
            </div>
            <span className="font-semibold" style={{ fontFamily: "var(--font-display)" }}>
              OurShiksha
            </span>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <Link href="/about" className="hover:text-foreground transition-colors">
              About
            </Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">
              Contact
            </Link>
          </nav>
          <p className="text-sm text-muted-foreground">
            OurShiksha {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  
  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    console.log("Contact form submitted:", data);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1">
        <section className="py-12 md:py-16">
          <div className="max-w-4xl mx-auto px-4 md:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <Badge variant="secondary" className="mb-4 gap-1.5">
                <MessageSquare className="w-4 h-4" />
                Get in Touch
              </Badge>
              
              <h1 
                className="text-3xl md:text-4xl font-bold mb-4"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Contact Us
              </h1>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Have questions about OurShiksha? We'd love to hear from you. 
                Send us a message and we'll respond as soon as possible.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              <motion.div 
                className="md:col-span-1 space-y-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Mail className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">Email Us</h3>
                        <a 
                          href="mailto:support@ourshiksha.com" 
                          className="text-sm text-muted-foreground hover:text-primary transition-colors"
                          data-testid="link-email-support"
                        >
                          support@ourshiksha.com
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">Location</h3>
                        <p className="text-sm text-muted-foreground">
                          Chennai, Tamil Nadu<br />
                          India
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="text-sm text-muted-foreground">
                  <p className="mb-2">
                    <strong>Response Time:</strong>
                  </p>
                  <p>We typically respond within 24-48 hours on business days.</p>
                </div>
              </motion.div>

              <motion.div 
                className="md:col-span-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card>
                  <CardContent className="p-6">
                    {submitted ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                          <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Message Sent!</h3>
                        <p className="text-muted-foreground mb-6">
                          Thank you for reaching out. We'll get back to you soon.
                        </p>
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setSubmitted(false);
                            form.reset();
                          }}
                          data-testid="button-send-another"
                        >
                          Send Another Message
                        </Button>
                      </div>
                    ) : (
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Your name" 
                                    {...field} 
                                    data-testid="input-contact-name"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="email" 
                                    placeholder="your@email.com" 
                                    {...field} 
                                    data-testid="input-contact-email"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="message"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Message</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="How can we help you?" 
                                    className="min-h-[150px] resize-none"
                                    {...field} 
                                    data-testid="input-contact-message"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <Button 
                            type="submit" 
                            className="w-full gap-2"
                            disabled={form.formState.isSubmitting}
                            data-testid="button-submit-contact"
                          >
                            <Send className="w-4 h-4" />
                            Send Message
                          </Button>
                        </form>
                      </Form>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
