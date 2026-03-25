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
  ArrowLeft,
  CheckCircle2,
  Crown,
  Eye,
  EyeOff,
  Shield,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useActor } from "../hooks/useActor";
import { type TitanRole, setTitanRole } from "../lib/titanRole";

type KeyType = "admin" | "owner" | null;

const ADMIN_KEY = "admin24517";
const OWNER_KEY = "titan2437";

interface AccessKeyModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (role: TitanRole) => void;
}

export function AccessKeyModal({
  open,
  onClose,
  onSuccess,
}: AccessKeyModalProps) {
  const [selectedType, setSelectedType] = useState<KeyType>(null);
  const [accessKey, setAccessKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { actor, isFetching: actorLoading } = useActor();

  const resetState = () => {
    setSelectedType(null);
    setAccessKey("");
    setShowKey(false);
    setError("");
    setSuccess("");
    setLoading(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleBack = () => {
    setSelectedType(null);
    setAccessKey("");
    setError("");
    setSuccess("");
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    const trimmedKey = accessKey.trim();

    if (!trimmedKey) {
      setError("Please enter an access key.");
      return;
    }
    if (!selectedType) return;

    console.log("[AccessKey] Entered key:", JSON.stringify(trimmedKey));
    console.log("[AccessKey] Selected type:", selectedType);
    console.log("[AccessKey] Actor available:", !!actor);

    setLoading(true);
    try {
      let result: "owner" | "admin" | "invalid" = "invalid";

      // Try backend verification first
      if (actor) {
        try {
          const raw = await (
            actor as unknown as {
              verifyAccessKey: (
                k: string,
              ) => Promise<
                { owner: null } | { admin: null } | { invalid: null }
              >;
            }
          ).verifyAccessKey(trimmedKey);
          console.log("[AccessKey] Backend raw result:", raw);
          if ("owner" in raw) result = "owner";
          else if ("admin" in raw) result = "admin";
          else result = "invalid";
        } catch (backendErr) {
          console.warn(
            "[AccessKey] Backend call failed, falling back to local check:",
            backendErr,
          );
          // Fallback: local validation
          if (trimmedKey === OWNER_KEY) result = "owner";
          else if (trimmedKey === ADMIN_KEY) result = "admin";
          else result = "invalid";
        }
      } else {
        // Actor not ready — use local validation as fallback
        console.warn("[AccessKey] Actor is null, using local key validation");
        if (trimmedKey === OWNER_KEY) result = "owner";
        else if (trimmedKey === ADMIN_KEY) result = "admin";
        else result = "invalid";
      }

      console.log(
        "[AccessKey] Resolved result:",
        result,
        "| Expected:",
        selectedType,
      );

      if (result === "invalid" || result !== selectedType) {
        setError("Invalid Key");
        setLoading(false);
        return;
      }

      const role: TitanRole = result;
      setTitanRole(role);
      const msg =
        role === "owner" ? "You are now the Owner" : "You are now an Admin";
      setSuccess(msg);
      console.log("[AccessKey] Role assigned:", role);

      setTimeout(() => {
        onSuccess(role);
        resetState();
      }, 1400);
    } catch (err) {
      console.error("[AccessKey] Unexpected error:", err);
      setError("Failed to verify key. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent
        className="bg-card border-border w-[calc(100vw-2rem)] max-w-sm overflow-hidden"
        data-ocid="access_key.modal"
      >
        <AnimatePresence mode="wait" initial={false}>
          {selectedType === null ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.22 }}
            >
              <DialogHeader className="mb-4">
                <DialogTitle className="text-foreground text-lg font-bold">
                  Become Admin / Owner
                </DialogTitle>
                <p className="text-muted-foreground text-sm">
                  Select the role you want to access
                </p>
              </DialogHeader>

              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  className="group flex items-center gap-4 rounded-xl border border-border bg-background/50 px-4 py-4 text-left hover:border-primary/60 hover:bg-primary/5 transition-all duration-200 cursor-pointer"
                  onClick={() => setSelectedType("admin")}
                  data-ocid="access_key.admin_button"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-500/15 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/25 transition-colors">
                    <Shield className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-foreground font-semibold">
                      Enter Admin Key
                    </p>
                    <p className="text-muted-foreground text-xs mt-0.5">
                      Manage and moderate posts
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  className="group flex items-center gap-4 rounded-xl border border-border bg-background/50 px-4 py-4 text-left hover:border-yellow-500/60 hover:bg-yellow-500/5 transition-all duration-200 cursor-pointer"
                  onClick={() => setSelectedType("owner")}
                  data-ocid="access_key.owner_button"
                >
                  <div className="w-12 h-12 rounded-xl bg-yellow-500/15 flex items-center justify-center flex-shrink-0 group-hover:bg-yellow-500/25 transition-colors">
                    <Crown className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-foreground font-semibold">
                      Enter Owner Key
                    </p>
                    <p className="text-muted-foreground text-xs mt-0.5">
                      Full control including all admin powers
                    </p>
                  </div>
                </button>

                <Button
                  variant="outline"
                  className="border-border mt-1"
                  onClick={handleClose}
                  data-ocid="access_key.cancel_button"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ duration: 0.22 }}
            >
              <DialogHeader className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-foreground transition-colors p-1 -ml-1 rounded-lg hover:bg-muted"
                    onClick={handleBack}
                    data-ocid="access_key.back_button"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      selectedType === "owner"
                        ? "bg-yellow-500/15"
                        : "bg-blue-500/15"
                    }`}
                  >
                    {selectedType === "owner" ? (
                      <Crown className="w-4 h-4 text-yellow-400" />
                    ) : (
                      <Shield className="w-4 h-4 text-blue-400" />
                    )}
                  </div>
                  <DialogTitle className="text-foreground text-lg font-bold">
                    {selectedType === "owner" ? "Owner Key" : "Admin Key"}
                  </DialogTitle>
                </div>
                <p className="text-muted-foreground text-sm">
                  Enter your secret key to gain{" "}
                  {selectedType === "owner" ? "owner" : "admin"} access
                </p>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="ak-input"
                    className="text-foreground font-medium"
                  >
                    {selectedType === "owner" ? "Owner" : "Admin"} Key
                  </Label>
                  <div className="relative">
                    <Input
                      id="ak-input"
                      type={showKey ? "text" : "password"}
                      placeholder="Enter your secret key..."
                      value={accessKey}
                      onChange={(e) => {
                        setAccessKey(e.target.value);
                        setError("");
                      }}
                      onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                      className="bg-input border-border pr-10 focus:ring-2 focus:ring-primary/40"
                      data-ocid="access_key.input"
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

                {actorLoading && !error && !success && (
                  <p className="text-muted-foreground text-xs">
                    Connecting to server...
                  </p>
                )}

                {error && (
                  <div
                    className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2"
                    data-ocid="access_key.error_state"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}

                {success && (
                  <div
                    className="flex items-center gap-2 text-green-400 text-sm bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2"
                    data-ocid="access_key.success_state"
                  >
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    {success}
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 border-border"
                    onClick={handleClose}
                    disabled={loading}
                    data-ocid="access_key.cancel_button"
                  >
                    Cancel
                  </Button>
                  <Button
                    className={`flex-1 text-primary-foreground ${
                      selectedType === "owner"
                        ? "bg-yellow-600 hover:bg-yellow-500"
                        : "bg-primary hover:bg-accent"
                    }`}
                    onClick={handleSubmit}
                    disabled={loading || !accessKey.trim()}
                    data-ocid="access_key.submit_button"
                  >
                    {loading ? "Verifying..." : "Submit"}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
