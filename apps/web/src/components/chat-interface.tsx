import * as React from "react";
import { useTamboThread, useTamboThreadInput } from "@tambo-ai/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ChatInput } from "./chat-input";

export function ChatInterface() {
  const { thread } = useTamboThread();
  const { setValue } = useTamboThreadInput();
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread?.messages]);

  return (
    <div className="flex flex-col relative ">
      <Card className="flex-1 m-4 overflow-hidden flex flex-col ring-0 bg-background gap-1 relative">
        <CardContent
          className="flex-1 overflow-y-auto  px-0 space-y-4 max-w-2xl mx-auto w-full no-scrollbar pb-40 pt-8 "
          style={{ scrollbarWidth: "initial" }}
        >
          {thread?.messages.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <p className="text-lg mb-2">Welcome to SQL Agent!</p>
              <p className="text-sm">
                Ask questions about your data in natural language.
              </p>
              <div className="mt-24 space-y-2">
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
                } rounded-lg p-3 overflow-hidden text-pretty`}
              >
                {Array.isArray(message.content) ? (
                  message.content.map((part, i) =>
                    part.type === "text" ? (
                      part.text?.includes("SELECT") ? (
                        <code className=" text-wrap ">{part.text}</code>
                      ) : (
                        <p key={i} className=" truncate text-sm whitespace-pre-wrap">
                          {part.text}
                        </p>
                      )
                    ) : null,
                  )
                ) : (
                  <div className="text-wrap">
                    <p className="text-sm">{`--> ${message.content}`}</p>
                  </div>
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

        <CardFooter className="px-0 border-0 fixed bottom-0 left-32 z-50 w-full flex items-center justify-center">
          <ChatInput />
        </CardFooter>
      </Card>
    </div>
  );
}
