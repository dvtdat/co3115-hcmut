import { useRef, useEffect, useState } from "react";
import { Bot, Loader2, Send, X } from "lucide-react";
import { useSendChatMessage } from "@/hooks/use-chatbot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
}

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(0);
  const sendMessage = useSendChatMessage();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sendMessage.isPending]);

  function nextId() {
    idRef.current += 1;
    return idRef.current;
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || sendMessage.isPending) return;
    setInput("");
    setMessages((prev) => [...prev, { id: nextId(), role: "user", content: text }]);
    try {
      const data = await sendMessage.mutateAsync(text);
      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          role: "assistant",
          content: data?.reply ?? "Sorry, I couldn't get a response.",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: "assistant", content: "Something went wrong. Please try again." },
      ]);
    }
  }

  return (
    <div className="fixed right-6 bottom-6 z-50 flex flex-col items-end">
      {/* Chat panel */}
      {open && (
        <div className="bg-background mb-3 flex h-[420px] w-80 flex-col rounded-2xl border shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <Bot className="text-primary size-4" />
              <span className="text-sm font-semibold">HealthyFood Assistant</span>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => {
                setOpen(false);
              }}
              aria-label="Close chat"
            >
              <X className="size-4" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto p-3">
            {messages.length === 0 && (
              <p className="text-muted-foreground pt-4 text-center text-xs">
                Ask me about products, prices, vouchers, or delivery!
              </p>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-3 py-2 text-sm",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground",
                  )}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {sendMessage.isPending && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl px-3 py-2">
                  <Loader2 className="text-muted-foreground size-4 animate-spin" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex gap-2 border-t p-3">
            <Input
              placeholder="Ask something…"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void handleSend();
                }
              }}
              className="text-sm"
              disabled={sendMessage.isPending}
            />
            <Button
              size="icon"
              onClick={() => {
                void handleSend();
              }}
              disabled={!input.trim() || sendMessage.isPending}
              aria-label="Send message"
            >
              <Send className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <Button
        size="icon"
        className="size-12 rounded-full shadow-lg"
        onClick={() => {
          setOpen((o) => !o);
        }}
        aria-label={open ? "Close chat" : "Open chat assistant"}
      >
        {open ? <X className="size-5" /> : <Bot className="size-5" />}
      </Button>
    </div>
  );
}
