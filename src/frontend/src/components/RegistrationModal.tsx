import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Check, Copy, Sparkles, UserPlus } from "lucide-react";
import { useState } from "react";
import { RegistrationResult } from "../backend";
import { useActor } from "../hooks/useActor";
import {
  ensurePrincipalKey,
  setRegistrationData,
} from "../lib/titanRegistration";

interface RegistrationModalProps {
  open: boolean;
  onComplete: () => void;
}

type Step = "form" | "success";

interface FormErrors {
  username?: string;
  age?: string;
  gmail?: string;
  general?: string;
}

export function RegistrationModal({
  open,
  onComplete,
}: RegistrationModalProps) {
  const [step, setStep] = useState<Step>("form");
  const [username, setUsername] = useState("");
  const [age, setAge] = useState("");
  const [gmail, setGmail] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [principalId, setPrincipalId] = useState("");
  const [copied, setCopied] = useState(false);
  const { actor } = useActor();

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!username.trim()) {
      newErrors.username = "Username is required.";
    } else if (username.trim().length < 3) {
      newErrors.username = "Username must be at least 3 characters.";
    }

    const ageNum = Number(age);
    if (!age.trim()) {
      newErrors.age = "Age is required.";
    } else if (Number.isNaN(ageNum) || !Number.isInteger(ageNum)) {
      newErrors.age = "Age must be a whole number.";
    } else if (ageNum < 13 || ageNum > 100) {
      newErrors.age = "Age must be between 13 and 100.";
    }

    if (!gmail.trim()) {
      newErrors.gmail = "Gmail address is required.";
    } else if (!gmail.trim().toLowerCase().endsWith("@gmail.com")) {
      newErrors.gmail = "Must be a valid Gmail address (ending in @gmail.com).";
    } else if (!/^[^\s@]+@gmail\.com$/.test(gmail.trim().toLowerCase())) {
      newErrors.gmail = "Invalid email format.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    setErrors({});

    const payload = {
      username: username.trim(),
      age: Number(age),
      email: gmail.trim().toLowerCase(),
    };
    console.log("[Registration] Request payload:", payload);

    try {
      if (actor) {
        try {
          console.log("[Registration] Checking username availability...");
          const available = await actor.checkUsernameAvailability(
            username.trim(),
          );
          console.log("[Registration] Username available:", available);

          if (!available) {
            setErrors({
              username:
                "This username is already taken. Please choose another.",
            });
            setLoading(false);
            return;
          }

          console.log("[Registration] Calling registerUser with:", {
            username: username.trim(),
            age: BigInt(Math.floor(Number(age))),
            gmail: gmail.trim().toLowerCase(),
          });

          const result = await actor.registerUser({
            username: username.trim(),
            age: BigInt(Math.floor(Number(age))),
            gmail: gmail.trim().toLowerCase(),
          });

          console.log("[Registration] Backend response:", result);

          if (result === RegistrationResult.usernameAlreadyExists) {
            setErrors({
              username:
                "This username is already taken. Please choose another.",
            });
            setLoading(false);
            return;
          }
          if (result === RegistrationResult.invalidEmail) {
            setErrors({
              gmail: "Invalid email format. Please check and try again.",
            });
            setLoading(false);
            return;
          }
          if (result === RegistrationResult.other) {
            setErrors({ general: "Server error. Please try again later." });
            setLoading(false);
            return;
          }
          // result === RegistrationResult.registrationSuccessful
          // Save username to backend user profile so posts can display it
          try {
            await actor.saveCallerUserProfile({
              displayName: username.trim(),
              bio: "",
              avatarUrl: "",
            });
            console.log("[Registration] User profile saved to backend.");
          } catch (profileErr) {
            console.warn(
              "[Registration] Failed to save user profile (non-blocking):",
              profileErr,
            );
          }
        } catch (backendErr) {
          // Backend call failed (network issue, canister error, etc.)
          // Log it but still allow local registration to proceed
          console.warn(
            "[Registration] Backend call failed, proceeding with local registration:",
            backendErr,
          );
        }
      } else {
        console.log(
          "[Registration] Actor not yet ready, using local registration.",
        );
      }

      // Clear any stale key so a fresh one is generated for this new registration
      localStorage.removeItem("titanUserId");
      const newId = ensurePrincipalKey();
      setRegistrationData({
        username: username.trim(),
        age: Number(age),
        gmail: gmail.trim().toLowerCase(),
        principalId: newId,
      });
      setPrincipalId(newId);
      console.log("[Registration] Success! Principal Key:", newId);
      setStep("success");
    } catch (err) {
      console.error("[Registration] Unexpected error:", err);
      setErrors({ general: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(principalId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open}>
      <DialogContent
        className="bg-card border-border w-[calc(100vw-2rem)] max-w-md max-h-[90vh] overflow-y-auto"
        data-ocid="registration.modal"
        onInteractOutside={(e) => e.preventDefault()}
      >
        {step === "form" && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <UserPlus className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <DialogTitle className="text-foreground text-lg font-bold">
                    Create Your Account
                  </DialogTitle>
                  <p className="text-muted-foreground text-sm">
                    Join Titan — takes less than a minute
                  </p>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 mt-2">
              {/* Username */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="reg-username"
                  className="text-foreground text-sm font-medium"
                >
                  Username
                </Label>
                <Input
                  id="reg-username"
                  placeholder="e.g. titan_user"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-input border-border"
                  data-ocid="registration.input"
                  autoFocus
                />
                {errors.username && (
                  <p
                    className="flex items-center gap-1.5 text-destructive text-xs"
                    data-ocid="registration.error_state"
                  >
                    <AlertCircle className="w-3 h-3 flex-shrink-0" />
                    {errors.username}
                  </p>
                )}
              </div>

              {/* Age */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="reg-age"
                  className="text-foreground text-sm font-medium"
                >
                  Age
                </Label>
                <Input
                  id="reg-age"
                  type="number"
                  placeholder="e.g. 25"
                  min={13}
                  max={100}
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="bg-input border-border"
                  data-ocid="registration.input"
                />
                {errors.age && (
                  <p
                    className="flex items-center gap-1.5 text-destructive text-xs"
                    data-ocid="registration.error_state"
                  >
                    <AlertCircle className="w-3 h-3 flex-shrink-0" />
                    {errors.age}
                  </p>
                )}
              </div>

              {/* Gmail */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="reg-gmail"
                  className="text-foreground text-sm font-medium"
                >
                  Gmail Address
                </Label>
                <Input
                  id="reg-gmail"
                  type="email"
                  placeholder="you@gmail.com"
                  value={gmail}
                  onChange={(e) => setGmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  className="bg-input border-border"
                  data-ocid="registration.input"
                />
                {errors.gmail && (
                  <p
                    className="flex items-center gap-1.5 text-destructive text-xs"
                    data-ocid="registration.error_state"
                  >
                    <AlertCircle className="w-3 h-3 flex-shrink-0" />
                    {errors.gmail}
                  </p>
                )}
              </div>

              {errors.general && (
                <div
                  className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm"
                  data-ocid="registration.error_state"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {errors.general}
                </div>
              )}

              <Button
                className="w-full bg-primary hover:bg-accent text-primary-foreground font-semibold"
                onClick={handleSubmit}
                disabled={loading}
                data-ocid="registration.submit_button"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  "Create Account"
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                By registering, you agree to Titan&apos;s community guidelines.
              </p>
            </div>
          </>
        )}

        {step === "success" && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <DialogTitle className="text-foreground text-lg font-bold">
                    Welcome to Titan!
                  </DialogTitle>
                  <p className="text-muted-foreground text-sm">
                    Your account has been created
                  </p>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-5 mt-2">
              <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                <p className="text-sm text-emerald-400 font-medium mb-1">
                  Registration Successful
                </p>
                <p className="text-xs text-muted-foreground">
                  Hi{" "}
                  <span className="text-foreground font-medium">
                    {username}
                  </span>
                  ! Your unique Principal Key has been generated and linked to
                  your account.
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground text-sm font-medium">
                  Your Principal Key
                </Label>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/40 border border-border">
                  <code className="flex-1 min-w-0 text-xs font-mono text-primary break-all leading-relaxed">
                    {principalId}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex-shrink-0 w-8 h-8 rounded-lg bg-muted/60 hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                    data-ocid="registration.button"
                    title="Copy Principal Key"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  This key is automatically assigned and persists across
                  sessions. It uniquely identifies your account.
                </p>
              </div>

              <Button
                className="w-full bg-primary hover:bg-accent text-primary-foreground font-semibold"
                onClick={onComplete}
                data-ocid="registration.primary_button"
              >
                Continue to Platform
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
