import {
  Crown,
  MessageCircle,
  RefreshCw,
  Rss,
  Shield,
  User,
} from "lucide-react";
import {
  type TitanRole,
  canPost,
  getRoleBadgeStyle,
  getRoleLabel,
} from "../lib/titanRole";

type View = "feed" | "chat" | "profile" | "admin";

interface SidebarProps {
  activeView: View;
  onNavigate: (view: View) => void;
  role: TitanRole;
  onResetRole: () => void;
}

const navItems = [
  { id: "feed" as View, label: "Feed", icon: Rss },
  { id: "chat" as View, label: "Chat", icon: MessageCircle },
  { id: "profile" as View, label: "Profile", icon: User },
];

export function Sidebar({
  activeView,
  onNavigate,
  role,
  onResetRole,
}: SidebarProps) {
  return (
    <aside className="hidden md:flex flex-col w-60 min-h-screen bg-sidebar border-r border-sidebar-border fixed left-0 top-0 bottom-0 z-20">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-black text-sm">T</span>
        </div>
        <span className="text-xl font-black text-foreground tracking-tight">
          Titan
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Main navigation">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-3">
          Navigation
        </p>
        {navItems.map((item) => (
          <button
            type="button"
            key={item.id}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              activeView === item.id
                ? "bg-sidebar-accent text-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            }`}
            onClick={() => onNavigate(item.id)}
            data-ocid={`sidebar.${item.id}.link`}
          >
            <item.icon
              className={`w-5 h-5 flex-shrink-0 ${activeView === item.id ? "text-primary" : ""}`}
            />
            {item.label}
          </button>
        ))}

        {canPost(role) && (
          <button
            type="button"
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              activeView === "admin"
                ? "bg-sidebar-accent text-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            }`}
            onClick={() => onNavigate("admin")}
            data-ocid="sidebar.admin.link"
          >
            <Shield
              className={`w-5 h-5 flex-shrink-0 ${activeView === "admin" ? "text-primary" : ""}`}
            />
            Admin Panel
          </button>
        )}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-sidebar-accent/30">
          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
            {role === "owner" ? (
              <Crown className="w-4 h-4 text-amber-400" />
            ) : (
              <User className="w-4 h-4" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {role === "owner"
                ? "Owner"
                : role === "admin"
                  ? "Admin"
                  : "Guest"}
            </p>
            <span
              className={`text-xs px-1.5 py-0.5 rounded-md border ${getRoleBadgeStyle(role)}`}
            >
              {getRoleLabel(role)}
            </span>
          </div>
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground transition-colors"
            onClick={onResetRole}
            data-ocid="sidebar.toggle"
            title="Switch Role"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
