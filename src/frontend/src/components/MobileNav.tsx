import { MessageCircle, Plus, Rss, Shield, User } from "lucide-react";
import { type TitanRole, canPost } from "../lib/titanRole";

type View = "feed" | "chat" | "profile" | "admin";

interface MobileNavProps {
  activeView: View;
  onNavigate: (view: View) => void;
  role: TitanRole;
  onCreatePost: () => void;
}

export function MobileNav({
  activeView,
  onNavigate,
  role,
  onCreatePost,
}: MobileNavProps) {
  const tabs = [
    { id: "feed" as View, label: "Home", icon: Rss },
    { id: "chat" as View, label: "Messages", icon: MessageCircle },
  ];

  const rightTabs = [
    { id: "profile" as View, label: "Profile", icon: User },
    ...(canPost(role)
      ? [{ id: "admin" as View, label: "Admin", icon: Shield }]
      : []),
  ];

  return (
    <nav
      className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 bg-card/90 backdrop-blur-xl border border-border rounded-full px-3 py-2 shadow-card"
      aria-label="Mobile navigation"
      data-ocid="mobile.tab"
    >
      {tabs.map((tab) => (
        <button
          type="button"
          key={tab.id}
          className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-full transition-colors ${
            activeView === tab.id
              ? "bg-primary/20 text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => onNavigate(tab.id)}
          data-ocid={`mobile.${tab.id}.link`}
        >
          <tab.icon className="w-5 h-5" />
          <span className="text-[10px] font-medium">{tab.label}</span>
        </button>
      ))}

      {canPost(role) && (
        <button
          type="button"
          className="w-12 h-12 rounded-full bg-primary hover:bg-accent text-primary-foreground flex items-center justify-center mx-1 shadow-glow transition-colors"
          onClick={onCreatePost}
          data-ocid="mobile.open_modal_button"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}
      {!canPost(role) && <div className="w-6" />}

      {rightTabs.map((tab) => (
        <button
          type="button"
          key={tab.id}
          className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-full transition-colors ${
            activeView === tab.id
              ? "bg-primary/20 text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => onNavigate(tab.id)}
          data-ocid={`mobile.${tab.id}.link`}
        >
          <tab.icon className="w-5 h-5" />
          <span className="text-[10px] font-medium">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
