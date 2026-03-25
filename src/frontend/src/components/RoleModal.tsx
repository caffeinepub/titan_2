import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertCircle,
  CheckCircle2,
  Crown,
  Eye,
  EyeOff,
  KeyRound,
  Shield,
  User,
} from "lucide-react";
import { useState } from "react";
import { UserRole } from "../backend";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { verifyAccessKey } from "../lib/accessKey";
import { type TitanRole, setTitanRole } from "../lib/titanRole";

interface RoleModalProps {
  open: boolean;
  onClose: (role: TitanRole) => void;
}

export function RoleModal({ open, onClose }: RoleModalProps) {
  const [mode, setMode] = useState<"select" | "owner" | "admin">("select");
  const [accessKey, setAccessKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { actor } = useActor();
  const { identity } = useInternetIdentity();

  const handleContinueAsUser = () => {
    setTitanRole("user");
    onClose("user");
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    if (!accessKey.trim()) {
      setError("Please enter an access key.");
      return;
    }
    setLoading(true);
    try {
      const result = await verifyAccessKey(actor, accessKey);

      if (result === "invalid") {
        setError("Invalid Key");
        setLoading(false);
        return;
      }

      const role: TitanRole = result === "owner" ? "owner" : "admin";
      setTitanRole(role);
      setSuccess(`Access granted as ${role === "owner" ? "Owner" : "Admin"}!`);

      if (actor && identity) {
        const principal = identity.getPrincipal();
        await actor.assignCallerUserRole(principal, UserRole.admin);
      }

      setTimeout(() => {
        onClose(role);
        setSuccess("");
        setAccessKey("");
        setMode("select");
      }, 1200);
    } catch {
      setError("Failed to verify key. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setMode("select");
    setAccessKey("");
    setError("");
    setSuccess("");
  };

  return (
    <Dialog open={open}>
      <DialogContent
        className="bg-card border-border w-[calc(100vw-2rem)] max-w-md max-h-[90vh] overflow-y-auto"
        data-ocid="role.modal"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-foreground text-lg font-bold">
                Welcome to Titan
              </DialogTitle>
              <p className="text-muted-foreground text-sm">
                Choose how you&apos;d like to continue
              </p>
            </div>
          </div>
        </DialogHeader>

        {mode === "select" && (
          <div className="space-y-3 mt-2">
            <button
              type="button"
              className="w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border border-border bg-muted/30 hover:bg-muted/60 transition-colors text-left"
              onClick={handleContinueAsUser}
              data-ocid="role.user_button"
            >
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground">
                  Continue as User
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  View posts and join conversations
                </p>
              </div>
              <Badge className="ml-auto flex-shrink-0 bg-muted text-muted-foreground border-border">
                User
              </Badge>
            </button>

            <button
              type="button"
              className="w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors text-left"
              onClick={() => setMode("admin")}
              data-ocid="role.admin_button"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground">Admin Access</p>
                <p className="text-sm text-muted-foreground truncate">
                  Create posts and manage content
                </p>
              </div>
              <Badge className="ml-auto flex-shrink-0 bg-primary/20 text-primary border-primary/30">
                Admin
              </Badge>
            </button>

            <button
              type="button"
              className="w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 transition-colors text-left"
              onClick={() => setMode("owner")}
              data-ocid="role.owner_button"
            >
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <Crown className="w-5 h-5 text-amber-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground">Owner Access</p>
                <p className="text-sm text-muted-foreground truncate">
                  Full control over the platform
                </p>
              </div>
              <Badge className="ml-auto flex-shrink-0 bg-amber-500/20 text-amber-400 border-amber-500/30">
                Owner
              </Badge>
            </button>
          </div>
        )}

        {(mode === "owner" || mode === "admin") && (
          <div className="space-y-4 mt-2">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border">
              <KeyRound className="w-5 h-5 text-primary flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-bold text-foreground">Enter Access Key</p>
                <p className="text-xs text-muted-foreground">
                  Enter your secret key to gain{" "}
                  {mode === "owner" ? "Owner" : "Admin"} access
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="role-access-key"
                className="text-foreground font-medium"
              >
                Access Key
              </Label>
              <div className="relative">
                <Input
                  id="role-access-key"
                  type={showKey ? "text" : "password"}
                  placeholder="Enter your secret key..."
                  value={accessKey}
                  onChange={(e) => {
                    setAccessKey(e.target.value);
                    setError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  className="bg-input border-border pr-10 focus:ring-2 focus:ring-primary/40"
                  data-ocid="role.input"
                  autoFocus
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div
                className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2"
                data-ocid="role.error_state"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 text-green-400 text-sm bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                {success}
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-border"
                onClick={handleCancel}
                disabled={loading}
                data-ocid="role.cancel_button"
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-primary hover:bg-accent text-primary-foreground"
                onClick={handleSubmit}
                disabled={loading || !accessKey.trim()}
                data-ocid="role.submit_button"
              >
                {loading ? "Verifying..." : "Submit"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
