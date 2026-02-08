import { useParams } from "react-router-dom";
import { useTamboThread } from "@tambo-ai/react";
import { ChatInterface } from "@/components/chat-interface";
import { useEffect } from "react";

export function ChatPage() {
  const { threadId } = useParams<{ threadId: string }>();
  const { switchCurrentThread, thread } = useTamboThread();

  useEffect(() => {
    if (threadId && threadId !== thread?.id) {
      switchCurrentThread(threadId);
    }
  }, [threadId, thread?.id, switchCurrentThread]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <ChatInterface />
    </div>
  );
}
