import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Check,
  Copy,
  Crown,
  Loader2,
  Mail,
  Shield,
  User,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCallerProfile } from "../hooks/useQueries";
import { getRegistrationData } from "../lib/titanRegistration";
import {
  type TitanRole,
  getRoleBadgeStyle,
  getRoleLabel,
} from "../lib/titanRole";
import { getInitials } from "../lib/titanUtils";

interface ProfileViewProps {
  role: TitanRole;
}

export function ProfileView({ role }: ProfileViewProps) {
  const { identity } = useInternetIdentity();
  const principal = identity?.getPrincipal().toString() || "";
  const { isLoading } = useCallerProfile();
  const registrationData = getRegistrationData();
  const regUsername = registrationData?.username ?? "";

  const [copiedPrincipal, setCopiedPrincipal] = useState(false);

  const displayName = regUsername || "Unnamed User";

  const copyPrincipal = () => {
    navigator.clipboard.writeText(principal).catch(() => {});
    toast.success("Principal copied!");
  };

  const copyRegPrincipal = async () => {
    if (!registrationData?.principalId) return;
    await navigator.clipboard.writeText(registrationData.principalId);
    setCopiedPrincipal(true);
    setTimeout(() => setCopiedPrincipal(false), 2000);
  };

  const initials = getInitials(displayName || principal.slice(0, 4));

  return (
    <div className="max-w-2xl mx-auto w-full" data-ocid="profile.section">
      <h1 className="text-3xl font-bold text-foreground mb-6">Profile</h1>

      {isLoading ? (
        <div
          className="flex justify-center py-16"
          data-ocid="profile.loading_state"
        >
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Profile Header Card */}
          <div className="bg-card border border-border rounded-2xl p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5">
              <Avatar className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
                <AvatarFallback className="bg-primary/20 text-primary text-xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 w-full">
                <h2 className="text-xl font-bold text-foreground truncate">
                  {displayName}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={`text-xs ${getRoleBadgeStyle(role)}`}>
                    {role === "owner" ? (
                      <Crown className="w-3 h-3 mr-1" />
                    ) : role === "admin" ? (
                      <Shield className="w-3 h-3 mr-1" />
                    ) : (
                      <User className="w-3 h-3 mr-1" />
                    )}
                    {getRoleLabel(role)}
                  </Badge>
                </div>
                {principal && (
                  <div className="flex items-center gap-2 mt-3 min-w-0">
                    <p className="text-xs font-mono text-muted-foreground truncate min-w-0 flex-1">
                      {principal}
                    </p>
                    <button
                      type="button"
                      onClick={copyPrincipal}
                      className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                      data-ocid="profile.secondary_button"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Registration Info Card */}
          <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 space-y-4">
            <h3 className="font-semibold text-foreground">Account Details</h3>

            {registrationData ? (
              <div className="space-y-3">
                {/* Username */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/50">
                  <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground mb-0.5">
                      Username
                    </p>
                    <p className="text-sm font-medium text-foreground truncate">
                      {registrationData.username}
                    </p>
                  </div>
                </div>

                {/* Age */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/50">
                  <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground mb-0.5">Age</p>
                    <p className="text-sm font-medium text-foreground">
                      {registrationData.age} years old
                    </p>
                  </div>
                </div>

                {/* Gmail */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/50">
                  <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground mb-0.5">
                      Gmail
                    </p>
                    <p className="text-sm font-medium text-foreground truncate">
                      {registrationData.gmail}
                    </p>
                  </div>
                </div>

                {/* Principal ID */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/50">
                  <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground mb-0.5">
                      Principal ID
                    </p>
                    <p className="text-xs font-mono text-foreground break-all leading-relaxed">
                      {registrationData.principalId}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={copyRegPrincipal}
                    className="flex-shrink-0 w-8 h-8 rounded-lg bg-muted/60 hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                    data-ocid="profile.secondary_button"
                    title="Copy Principal ID"
                  >
                    {copiedPrincipal ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <p
                className="text-sm text-muted-foreground italic py-2"
                data-ocid="profile.empty_state"
              >
                No registration data found.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
