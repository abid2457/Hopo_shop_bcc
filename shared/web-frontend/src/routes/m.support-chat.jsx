import { useState } from "react";
import { AppHeader, MobileFrame } from "@/components/app/MobileShell";
import { SUPPORT_CHAT } from "@/lib/hopo-extra";
import { Paperclip, Send, Smile } from "lucide-react";
export function SupportChatPage() {
  const [messages, setMessages] = useState([...SUPPORT_CHAT]);
  const [text, setText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const sendMessage = (content) => {
    if (!content.trim()) return;
    const userMsg = {
      role: "user",
      text: content,
      time: "Just now",
    };
    setMessages((prev) => [...prev, userMsg]);
    setText("");
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `Thank you for reaching out! We've noted "${content}" and our concierge stylist is checking your order status right now.`,
          time: "Just now",
        },
      ]);
    }, 1200);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(text);
  };
  return (
    <MobileFrame>
      <AppHeader title="HOPO SHOP Assist" back showSearch={false} showBell={false} />

      <div className="px-4 pb-32">
        <div className="rounded-lg bg-primary-soft text-primary px-3 py-2 text-[11px] text-center">
          You're chatting with our AI assistant. We'll loop in a stylist if needed.
        </div>

        <div className="mt-4 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm shadow-soft leading-relaxed ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-card rounded-bl-sm border"
                }`}
              >
                <p>{m.text}</p>
                <p
                  className={`mt-1 text-[10px] ${m.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                >
                  {m.time}
                </p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-card rounded-2xl rounded-bl-sm px-3.5 py-2 text-xs text-muted-foreground shadow-soft border animate-pulse">
                HOPO SHOP Assist is typing…
              </div>
            </div>
          )}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {["Track my order", "Cancel an order", "Request invoice", "Wrong size"].map((q) => (
            <button
              key={q}
              onClick={() => sendMessage(q)}
              className="rounded-full border bg-card px-3.5 py-1.5 text-xs hover:border-primary/50 transition font-medium text-foreground"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="fixed md:absolute bottom-0 left-0 right-0 border-t bg-card px-3 py-2.5 flex items-center gap-2 z-20"
      >
        <button
          type="button"
          aria-label="Attach file"
          className="p-2 text-muted-foreground hover:text-foreground"
        >
          <Paperclip className="h-5 w-5" />
        </button>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your message…"
          className="flex-1 bg-secondary rounded-full px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
        />
        <button
          type="button"
          aria-label="Add emoji"
          className="p-2 text-muted-foreground hover:text-foreground"
        >
          <Smile className="h-5 w-5" />
        </button>
        <button
          type="submit"
          aria-label="Send message"
          className="grid place-items-center h-9 w-9 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition shadow-xs"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </MobileFrame>
  );
}
export default SupportChatPage;
