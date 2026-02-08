import * as React from "react";
import { useTamboThread, useTamboThreadInput } from "@tambo-ai/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useConnectionStore } from "@/store/connection-store";
import { useConnections } from "@/hooks/use-connections";
import { IconSend, IconPlayerStop, IconDatabase } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ChatInputProps {
  className?: string;
}

export function ChatInput({ className }: ChatInputProps) {
  const { thread, cancel } = useTamboThread();
  const { value, setValue, submit, isPending } = useTamboThreadInput();
  const { connections, connectionsLoading } = useConnections();
  const { selectedConnectionId, selectConnection } = useConnectionStore();

  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  React.useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [value]);

  const handleSubmit = async () => {
    if (!value.trim()) return;

    if (isPending) {
      // Stop the stream
      if (thread?.id) {
        cancel(thread.id);
      }
      return;
    }

    if (!selectedConnectionId) {
      // Could show a toast here
      toast.warning("Please select a database connection first");
      console.warn("Please select a database connection first");
      return;
    }

    await submit({
      streamResponse: true,
      forceToolChoice: "required",
    });
    setValue("");

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div
      className={cn(
        "w-full relative flex flex-col gap-2 p-3 max-w-2xl mx-auto",
        className,
        " bg-card border-2",
      )}
    >
      {/* Textarea */}
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask about your data... (e.g., Show me sales by month)"
        disabled={isPending}
        className="min-h-15 border-0 px-2 py-2 text-lg font-medium placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent dark:bg-transparent"
        rows={1}
      />

      {/* Bottom toolbar */}
      <div className="flex items-center justify-between gap-4 mt-4">
        {/* Left side: Connection selector */}
        <div className="flex items-center gap-2">
          <Select
            value={selectedConnectionId || ""}
            onValueChange={selectConnection}
            disabled={connectionsLoading || isPending}
          >
            <SelectTrigger className="h-8 w-50 not-first:gap-2 text-xs">
              <IconDatabase className="h-3.5 w-3.5 text-muted-foreground" />
              <SelectValue placeholder="Select database">
                {selectedConnectionId
                  ? connections &&
                    connections?.find((c) => c.id === selectedConnectionId)
                      ?.name
                  : "Select connection"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {connectionsLoading ? (
                <SelectItem value="loading" disabled>
                  Loading connections...
                </SelectItem>
              ) : connections?.length === 0 ? (
                <SelectItem value="none" disabled>
                  No connections available
                </SelectItem>
              ) : (
                connections?.map((conn) => (
                  <SelectItem key={conn.id} value={conn.id}>
                    <div className="flex items-center gap-2">
                      <span className="capitalize">{conn?.name}</span>
                      <span className="text-muted-foreground text-[10px]">
                        {conn?.id.slice(0, 8)}...
                      </span>
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Right side: Send/Stop button */}
        <div className="flex items-center gap-2">
          {/* {isPending && (
            <span className="text-xs text-muted-foreground animate-pulse">
              Thinking...
            </span>
          )} */}
          <Button
            type="button"
            size="icon-lg"
            onClick={handleSubmit}
            disabled={!value.trim() && !isPending}
            className={cn(
              "h-8 w-8 rounded-full transition-all",
              isPending
                ? "bg-destructive hover:bg-destructive/90"
                : "bg-primary hover:bg-primary/90",
            )}
          >
            {isPending ? (
              <IconPlayerStop className="h-4 w-4 fill-current" />
            ) : (
              <IconSend className="h-4 w-4 fill-current" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
