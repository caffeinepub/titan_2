import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2, Eye, EyeOff, KeyRound } from "lucide-react";
import { useState } from "react";
import { useActor } from "../hooks/useActor";
import { verifyAccessKey } from "../lib/accessKey";
import { type TitanRole, setTitanRole } from "../lib/titanRole";

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
  const [accessKey, setAccessKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { actor } = useActor();

  const handleClose = () => {
    setAccessKey("");
    setError("");
    setSuccess("");
    onClose();
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

      setTimeout(() => {
        onSuccess(role);
        setAccessKey("");
        setSuccess("");
      }, 1200);
    } catch {
      setError("Failed to verify key. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent
        className="bg-card border-border w-[calc(100vw-2rem)] max-w-sm"
        data-ocid="access_key.modal"
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
              <KeyRound className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-foreground text-lg font-bold">
                Enter Access Key
              </DialogTitle>
              <p className="text-muted-foreground text-sm">
                Enter your secret key to upgrade your role
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="ak-input" className="text-foreground font-medium">
              Access Key
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

          {error && (
            <div
              className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2"
              data-ocid="access_key.error"
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
              onClick={handleClose}
              disabled={loading}
              data-ocid="access_key.cancel"
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-primary hover:bg-accent text-primary-foreground"
              onClick={handleSubmit}
              disabled={loading || !accessKey.trim()}
              data-ocid="access_key.submit"
            >
              {loading ? "Verifying..." : "Submit"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
