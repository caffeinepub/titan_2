import {
  Crown,
  Home,
  KeyRound,
  MessageCircle,
  PenSquare,
  Shield,
  User,
} from "lucide-react";
import { type TitanRole, canPost } from "../lib/titanRole";

type View = "feed" | "chat" | "profile" | "admin";

interface MobileNavProps {
  activeView: View;
  onNavigate: (view: View) => void;
  role: TitanRole;
  onCreatePost: () => void;
  onBecomeAdmin?: () => void;
}

export function MobileNav({
  activeView,
  onNavigate,
  role,
  onCreatePost,
  onBecomeAdmin,
}: MobileNavProps) {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-background/95 backdrop-blur-xl border-t border-border"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around px-2 py-2 safe-area-pb">
        <button
          type="button"
          className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors ${
            activeView === "feed"
              ? "text-primary bg-primary/10"
              : "text-muted-foreground"
          }`}
          onClick={() => onNavigate("feed")}
          data-ocid="mobile_nav.feed.button"
        >
          <Home className="w-5 h-5" />
          <span className="text-xs font-medium">Home</span>
        </button>

        <button
          type="button"
          className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors ${
            activeView === "chat"
              ? "text-primary bg-primary/10"
              : "text-muted-foreground"
          }`}
          onClick={() => onNavigate("chat")}
          data-ocid="mobile_nav.chat.button"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-xs font-medium">Messages</span>
        </button>

        {canPost(role) && (
          <button
            type="button"
            className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl bg-primary text-primary-foreground"
            onClick={onCreatePost}
            data-ocid="mobile_nav.create.button"
          >
            <PenSquare className="w-5 h-5" />
            <span className="text-xs font-medium">Post</span>
          </button>
        )}

        {role === "user" && onBecomeAdmin && (
          <button
            type="button"
            className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl text-amber-400/80 hover:bg-amber-500/10 transition-colors"
            onClick={onBecomeAdmin}
            data-ocid="mobile_nav.become_admin.button"
          >
            <KeyRound className="w-5 h-5" />
            <span className="text-xs font-medium">Access</span>
          </button>
        )}

        {canPost(role) && (
          <button
            type="button"
            className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors ${
              activeView === "admin"
                ? "text-primary bg-primary/10"
                : "text-muted-foreground"
            }`}
            onClick={() => onNavigate("admin")}
            data-ocid="mobile_nav.admin.button"
          >
            <Shield className="w-5 h-5" />
            <span className="text-xs font-medium">Admin</span>
          </button>
        )}

        <button
          type="button"
          className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors ${
            activeView === "profile"
              ? "text-primary bg-primary/10"
              : "text-muted-foreground"
          }`}
          onClick={() => onNavigate("profile")}
          data-ocid="mobile_nav.profile.button"
        >
          <User className="w-5 h-5" />
          <span className="text-xs font-medium">Profile</span>
        </button>
      </div>
    </nav>
  );
}
