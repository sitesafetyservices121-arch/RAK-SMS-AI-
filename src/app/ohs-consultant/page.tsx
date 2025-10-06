"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send, User, Paperclip, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { askWilsonAction } from "./actions";
import { ThinkingAnimation } from "@/components/ui/loading-dots";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { WilsonLogo } from "@/components/wilson-logo";
import { Badge } from "@/components/ui/badge";

const formSchema = z.object({
  query: z.string().min(1, {
    message: "Query cannot be empty.",
  }),
});

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function OhsConsultantPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentDataUri, setDocumentDataUri] = useState<string | null>(null);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      query: "",
    },
  });

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setDocumentFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setDocumentDataUri(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeDocument = () => {
    setDocumentFile(null);
    setDocumentDataUri(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    const userMessage: Message = { role: "user", content: values.query };
    setMessages((prev) => [...prev, userMessage]);
    form.reset();

    const history = [...messages, userMessage].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const response = await askWilsonAction({
      query: values.query,
      history,
      documentDataUri: documentDataUri || undefined,
    });

    setIsLoading(false);
    removeDocument();

    if (response.success && response.data) {
      const assistantMessage: Message = {
        role: "assistant",
        content: (response.data as { answer: string }).answer,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } else {
      const errorMessage = "error" in response ? response.error : "Failed to contact Wilson.";

      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
      // remove the user message if the call fails
      setMessages((prev) => prev.slice(0, -1));
    }
  }

  return (
    <Card className="flex flex-col h-[calc(100vh-10rem)] max-h-[800px]">
      <CardHeader>
        <CardTitle>Wilson - OHS Act Consultant</CardTitle>
        <CardDescription>
          Your AI consultant for OHS, COID, and relevant South African acts.
          Attach a document for context-specific questions.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
          <div className="space-y-6">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <WilsonLogo className="h-12 w-12 mb-4" />
                <p>Ask me anything about the OHS Act.</p>
                <p className="text-xs">
                  You can also attach a document to ask questions about it.
                </p>
              </div>
            )}
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-start gap-3",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === "assistant" && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-transparent text-primary-foreground">
                      <WilsonLogo className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "max-w-sm rounded-lg px-4 py-3 text-sm lg:max-w-md",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  <pre className="whitespace-pre-wrap font-sans">
                    {message.content}
                  </pre>
                </div>
                {message.role === "user" && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-3 justify-start">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-transparent">
                    <WilsonLogo className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="max-w-sm rounded-lg px-4 py-3 bg-muted">
                  <ThinkingAnimation />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="pt-4 border-t flex flex-col items-start gap-2">
        {documentFile && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="pl-2">
              {documentFile.name}
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 ml-1"
                onClick={removeDocument}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          </div>
        )}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex w-full items-start space-x-2"
          >
            <Input
              id="file-upload-chat"
              type="file"
              className="hidden"
              onChange={handleFileChange}
              ref={fileInputRef}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              title="Attach document"
            >
              <Paperclip className="h-4 w-4" />
              <span className="sr-only">Attach document</span>
            </Button>
            <FormField
              control={form.control}
              name="query"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input
                      placeholder="Ask Wilson a question..."
                      {...field}
                      disabled={isLoading}
                      autoComplete="off"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading} size="icon">
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </Form>
      </CardFooter>
    </Card>
  );
}
