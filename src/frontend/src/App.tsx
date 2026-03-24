import { Toaster } from "@/components/ui/sonner";
import { Bell, Search } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { AdminPanel } from "./components/AdminPanel";
import { ChatView } from "./components/ChatView";
import { CreatePostModal } from "./components/CreatePostModal";
import { FeedView } from "./components/FeedView";
import { LoginScreen } from "./components/LoginScreen";
import { MobileNav } from "./components/MobileNav";
import { ProfileView } from "./components/ProfileView";
import { RoleModal } from "./components/RoleModal";
import { Sidebar } from "./components/Sidebar";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { type TitanRole, clearTitanRole, getTitanRole } from "./lib/titanRole";

type View = "feed" | "chat" | "profile" | "admin";

export default function App() {
  const { identity, isLoginSuccess, clear, isInitializing } =
    useInternetIdentity();
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [role, setRole] = useState<TitanRole>("user");
  const [activeView, setActiveView] = useState<View>("feed");
  const [mobileCreateOpen, setMobileCreateOpen] = useState(false);

  useEffect(() => {
    if (isLoginSuccess && identity) {
      const stored = getTitanRole();
      if (stored !== "user") {
        setRole(stored);
      } else {
        setShowRoleModal(true);
      }
    }
  }, [isLoginSuccess, identity]);

  const handleRoleSelected = (selectedRole: TitanRole) => {
    setRole(selectedRole);
    setShowRoleModal(false);
  };

  const handleLogout = () => {
    clearTitanRole();
    setRole("user");
    setActiveView("feed");
    clear();
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-black text-lg">
              T
            </span>
          </div>
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!identity) {
    return (
      <>
        <LoginScreen />
        <Toaster theme="dark" />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar
        activeView={activeView}
        onNavigate={setActiveView}
        role={role}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col md:ml-60 min-h-screen">
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border px-4 md:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 md:hidden">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-black text-xs">
                T
              </span>
            </div>
            <span className="font-black text-foreground">Titan</span>
          </div>

          <div className="hidden md:block">
            <span className="text-sm font-medium text-muted-foreground capitalize">
              {activeView}
            </span>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              className="w-8 h-8 rounded-lg bg-muted/40 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              data-ocid="header.button"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="w-8 h-8 rounded-lg bg-muted/40 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              data-ocid="header.secondary_button"
            >
              <Bell className="w-4 h-4" />
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 md:px-6 py-6 pb-24 md:pb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {activeView === "feed" && <FeedView role={role} />}
              {activeView === "chat" && <ChatView />}
              {activeView === "profile" && <ProfileView role={role} />}
              {activeView === "admin" && <AdminPanel role={role} />}
            </motion.div>
          </AnimatePresence>
        </main>

        <footer className="hidden md:block border-t border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-4 text-xs text-muted-foreground">
              {["About", "Terms", "Privacy", "Community"].map((link) => (
                <span
                  key={link}
                  className="hover:text-foreground transition-colors cursor-pointer"
                >
                  {link}
                </span>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()}. Built with &hearts; using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </footer>
      </div>

      <MobileNav
        activeView={activeView}
        onNavigate={setActiveView}
        role={role}
        onCreatePost={() => setMobileCreateOpen(true)}
      />

      <CreatePostModal
        open={mobileCreateOpen}
        onClose={() => setMobileCreateOpen(false)}
      />

      <RoleModal open={showRoleModal} onClose={handleRoleSelected} />

      <Toaster theme="dark" richColors />
    </div>
  );
}
