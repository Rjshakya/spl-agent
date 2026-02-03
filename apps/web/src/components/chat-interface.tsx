"use client";

import * as React from "react";
import { useTamboThread, useTamboThreadInput } from "@tambo-ai/react";
import { Button } from "@/components/ui/button.js";
import { Input } from "@/components/ui/input.js";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.js";
import { Badge } from "@/components/ui/badge.js";
import { Separator } from "@/components/ui/separator.js";
import { IconSend, IconLoader2 } from "@tabler/icons-react";

export function ChatInterface() {
  const { thread } = useTamboThread();
  const { value, setValue, submit, isPending } = useTamboThreadInput();
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread?.messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim() || isPending) return;

    await submit({
      streamResponse: true,
    });
  };

  return (
    <div className="flex flex-col h-screen max-h-screen">
      <Card className="flex-1 m-4 overflow-hidden flex flex-col">
        <CardHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <CardTitle>SQL Agent</CardTitle>
            <Badge variant="outline">Tambo AI</Badge>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {thread?.messages.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <p className="text-lg mb-2">Welcome to SQL Agent!</p>
              <p className="text-sm">
                Ask questions about your data in natural language.
              </p>
              <div className="mt-6 space-y-2">
                <p className="text-xs text-muted-foreground">Try asking:</p>
                {[
                  "How many users do we have?",
                  "Show me user signups over time",
                  "What are the top 10 active users?",
                ].map((example) => (
                  <Button
                    key={example}
                    variant="ghost"
                    size="sm"
                    className="block w-full text-left"
                    onClick={() => setValue(example)}
                  >
                    {example}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {thread?.messages.map((message, index) => (
            <div
              key={message.id || index}
              className={`flex flex-col ${
                message.role === "user" ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`max-w-[85%] ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                } rounded-lg p-3`}
              >
                {Array.isArray(message.content) ? (
                  message.content.map((part, i) =>
                    part.type === "text" ? (
                      <p key={i} className="text-sm whitespace-pre-wrap">
                        {part.text}
                      </p>
                    ) : null,
                  )
                ) : (
                  <p className="text-sm">{String(message.content)}</p>
                )}

                {message.toolCallRequest && (
                  <div className="mt-2 text-xs opacity-70">
                    → {message.toolCallRequest.toolName}
                  </div>
                )}
              </div>

              {message.renderedComponent && (
                <div className="w-full mt-3">{message.renderedComponent}</div>
              )}
            </div>
          ))}

          <div ref={messagesEndRef} />
        </CardContent>

        <Separator />

        <CardContent className="p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Ask about your data..."
              disabled={isPending}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={isPending || !value.trim()}
              size="icon"
            >
              {isPending ? (
                <IconLoader2 className="h-4 w-4 animate-spin" />
              ) : (
                <IconSend className="h-4 w-4" />
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
