import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Principal } from "@icp-sdk/core/principal";
import { ArrowLeft, Loader2, MessageCircle, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useConversation, useSendMessage } from "../hooks/useQueries";
import { formatRelativeTime, getInitials } from "../lib/utils";

export function ChatView() {
  const [principalInput, setPrincipalInput] = useState("");
  const [activePrincipal, setActivePrincipal] = useState<Principal | null>(
    null,
  );
  const [messageText, setMessageText] = useState("");
  const [principalError, setPrincipalError] = useState("");
  const { identity } = useInternetIdentity();
  const myPrincipal = identity?.getPrincipal().toString();

  const { data: messages = [], isLoading } = useConversation(activePrincipal);
  const sendMessage = useSendMessage();

  const handleStartChat = () => {
    setPrincipalError("");
    try {
      const p = Principal.fromText(principalInput.trim());
      setActivePrincipal(p);
    } catch {
      setPrincipalError("Invalid principal ID. Please check and try again.");
    }
  };

  const handleSend = async () => {
    if (!messageText.trim() || !activePrincipal) return;
    try {
      await sendMessage.mutateAsync({
        recipient: activePrincipal,
        content: messageText.trim(),
      });
      setMessageText("");
    } catch {
      toast.error("Failed to send message");
    }
  };

  return (
    <div
      className="max-w-2xl mx-auto w-full h-full flex flex-col"
      data-ocid="chat.section"
    >
      <h1 className="text-3xl font-bold text-foreground mb-6">Messages</h1>

      {!activePrincipal ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-full max-w-md space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">
                Start a Conversation
              </h2>
              <p className="text-muted-foreground text-sm">
                Enter a user&apos;s Principal ID to start chatting
              </p>
            </div>

            <div className="space-y-3">
              <Input
                placeholder="Paste Principal ID (e.g. abc12-def34-...)"
                value={principalInput}
                onChange={(e) => setPrincipalInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleStartChat()}
                className="bg-input border-border"
                data-ocid="chat.input"
              />
              {principalError && (
                <p
                  className="text-destructive text-sm"
                  data-ocid="chat.error_state"
                >
                  {principalError}
                </p>
              )}
              <Button
                className="w-full bg-primary hover:bg-accent text-primary-foreground"
                onClick={handleStartChat}
                disabled={!principalInput.trim()}
                data-ocid="chat.primary_button"
              >
                Start Chat
              </Button>
            </div>

            <div className="p-4 rounded-xl bg-muted/20 border border-border">
              <p className="text-xs text-muted-foreground text-center">
                Your Principal ID:{" "}
                <span className="font-mono text-foreground">
                  {myPrincipal || "Not logged in"}
                </span>
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0 bg-card rounded-2xl border border-border overflow-hidden">
          {/* Chat Header */}
          <div className="flex items-center gap-3 p-4 border-b border-border">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={() => setActivePrincipal(null)}
              data-ocid="chat.close_button"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold">
              {getInitials(activePrincipal.toString().slice(0, 5))}
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">
                {activePrincipal.toString().slice(0, 8)}...
              </p>
              <p className="text-xs text-muted-foreground">Principal ID</p>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            {isLoading && (
              <div
                className="flex justify-center py-8"
                data-ocid="chat.loading_state"
              >
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            )}
            {!isLoading && messages.length === 0 && (
              <div className="text-center py-8" data-ocid="chat.empty_state">
                <p className="text-muted-foreground text-sm">
                  No messages yet. Say hello!
                </p>
              </div>
            )}
            <div className="space-y-3">
              {messages.map((msg, i) => {
                const isMe = msg.sender.toString() === myPrincipal;
                return (
                  <div
                    key={msg.id.toString()}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                    data-ocid={`chat.item.${i + 1}`}
                  >
                    <div
                      className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                        isMe
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-muted/60 text-foreground rounded-bl-sm"
                      }`}
                    >
                      <p>{msg.content}</p>
                      <p
                        className={`text-xs mt-1 ${isMe ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                      >
                        {formatRelativeTime(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="p-4 border-t border-border flex gap-2">
            <Input
              placeholder="Type a message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="bg-input border-border"
              data-ocid="chat.textarea"
            />
            <Button
              className="bg-primary hover:bg-accent text-primary-foreground px-4 flex-shrink-0"
              onClick={handleSend}
              disabled={sendMessage.isPending || !messageText.trim()}
              data-ocid="chat.submit_button"
            >
              {sendMessage.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
