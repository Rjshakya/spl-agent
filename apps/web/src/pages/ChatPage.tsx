import { ChatInterface } from "@/components/chat-interface.js";

export function ChatPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <ChatInterface />
    </div>
  );
}
