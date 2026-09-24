import { useState } from "react";
import { LoaderCircle, MessageCircle, Send, X } from "lucide-react";
import { sendChatMessage } from "@/lib/chat";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const initialMessage: ChatMessage = {
  role: "assistant",
  content: "হ্যালো! Humidifier সম্পর্কে কী জানতে চান? আমি সাহায্য করতে পারি।",
};

export function LiveChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");

  const submitMessage = async () => {
    const content = input.trim();
    if (!content || isSending) return;

    const nextMessages = [...messages, { role: "user" as const, content }];
    setMessages(nextMessages);
    setInput("");
    setError("");
    setIsSending(true);

    try {
      const result = await sendChatMessage({ data: { messages: nextMessages } });
      setMessages((current) => [...current, { role: "assistant", content: result.content }]);
    } catch {
      setError("দুঃখিত, এখন উত্তর দেওয়া যাচ্ছে না। WhatsApp Support ব্যবহার করুন।");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      {isOpen && (
        <section
          aria-label="Live chat support"
          className="fixed bottom-[7.5rem] right-3 z-50 flex w-[min(22rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl md:bottom-24 md:right-5"
        >
          <header className="flex items-center justify-between bg-primary px-4 py-3 text-primary-foreground">
            <div>
              <p className="font-bold">Live Chat Support</p>
              <p className="text-xs opacity-85">সাধারণ প্রশ্নের দ্রুত উত্তর</p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close live chat"
              className="rounded-full p-1.5 transition hover:bg-white/15"
            >
              <X className="h-5 w-5" />
            </button>
          </header>

          <div className="flex max-h-72 min-h-40 flex-col gap-2 overflow-y-auto bg-background p-3">
            {messages.map((message, index) => (
              <p
                key={`${message.role}-${index}`}
                className={`max-w-[88%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                  message.role === "user"
                    ? "self-end rounded-br-sm bg-primary text-primary-foreground"
                    : "self-start rounded-bl-sm bg-secondary text-foreground"
                }`}
              >
                {message.content}
              </p>
            ))}
            {isSending && (
              <p className="flex items-center gap-2 self-start rounded-2xl rounded-bl-sm bg-secondary px-3 py-2 text-sm text-muted-foreground">
                <LoaderCircle className="h-4 w-4 animate-spin" />
                উত্তর তৈরি হচ্ছে...
              </p>
            )}
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>

          <form
            className="flex gap-2 border-t border-border bg-card p-3"
            onSubmit={(event) => {
              event.preventDefault();
              void submitMessage();
            }}
          >
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="আপনার প্রশ্ন লিখুন..."
              aria-label="Chat message"
              maxLength={1200}
              className="min-w-0 flex-1 rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <button
              type="submit"
              disabled={!input.trim() || isSending}
              aria-label="Send message"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close live chat" : "Open live chat support"}
        className="fixed bottom-[3.75rem] right-3 z-50 inline-flex h-9 min-h-9 items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-lg transition-transform hover:scale-105 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 md:bottom-[4.75rem] md:right-5"
      >
        <MessageCircle className="h-4 w-4" />
        <span>Chat Support</span>
      </button>
    </>
  );
}