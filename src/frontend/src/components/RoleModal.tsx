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
import { AlertCircle, Crown, Eye, EyeOff, Shield, User } from "lucide-react";
import { useState } from "react";
import { UserRole } from "../backend";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { type TitanRole, setTitanRole } from "../lib/titanRole";

interface RoleModalProps {
  open: boolean;
  onClose: (role: TitanRole) => void;
}

const OWNER_PASSCODE = "owner342754";
const ADMIN_PASSCODE = "admin24638";

export function RoleModal({ open, onClose }: RoleModalProps) {
  const [mode, setMode] = useState<"select" | "owner" | "admin">("select");
  const [passcode, setPasscode] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { actor } = useActor();
  const { identity } = useInternetIdentity();

  const handleContinueAsUser = () => {
    setTitanRole("user");
    onClose("user");
  };

  const handleUnlock = async () => {
    setError("");
    setLoading(true);
    try {
      const isOwner = mode === "owner" && passcode === OWNER_PASSCODE;
      const isAdmin = mode === "admin" && passcode === ADMIN_PASSCODE;

      if (!isOwner && !isAdmin) {
        setError("Incorrect passcode. Please try again.");
        setLoading(false);
        return;
      }

      const role: TitanRole = isOwner ? "owner" : "admin";
      setTitanRole(role);

      if (actor && identity) {
        const principal = identity.getPrincipal();
        await actor.assignCallerUserRole(principal, UserRole.admin);
      }

      onClose(role);
    } catch {
      setError("Failed to assign role. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setMode("select");
    setPasscode("");
    setError("");
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
              {mode === "owner" ? (
                <Crown className="w-5 h-5 text-amber-400 flex-shrink-0" />
              ) : (
                <Shield className="w-5 h-5 text-primary flex-shrink-0" />
              )}
              <div className="min-w-0">
                <p className="font-semibold text-sm">
                  {mode === "owner" ? "Owner" : "Admin"} Passcode
                </p>
                <p className="text-xs text-muted-foreground">
                  Enter your secure passcode to unlock
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="passcode" className="text-foreground">
                Passcode
              </Label>
              <div className="relative">
                <Input
                  id="passcode"
                  type={showPass ? "text" : "password"}
                  placeholder="Enter passcode..."
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
                  className="bg-input border-border pr-10"
                  data-ocid="role.input"
                  autoFocus
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div
                className="flex items-center gap-2 text-destructive text-sm"
                data-ocid="role.error_state"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-border"
                onClick={handleBack}
                data-ocid="role.cancel_button"
              >
                Back
              </Button>
              <Button
                className="flex-1 bg-primary hover:bg-accent text-primary-foreground"
                onClick={handleUnlock}
                disabled={loading || !passcode}
                data-ocid="role.submit_button"
              >
                {loading ? "Verifying..." : "Unlock"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
