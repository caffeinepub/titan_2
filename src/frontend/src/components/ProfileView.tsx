import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Crown, Loader2, Save, Shield, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCallerProfile, useUpdateProfile } from "../hooks/useQueries";
import {
  type TitanRole,
  getRoleBadgeStyle,
  getRoleLabel,
} from "../lib/titanRole";
import { getInitials } from "../lib/utils";

interface ProfileViewProps {
  role: TitanRole;
}

export function ProfileView({ role }: ProfileViewProps) {
  const { identity } = useInternetIdentity();
  const principal = identity?.getPrincipal().toString() || "";
  const { data: profile, isLoading } = useCallerProfile();
  const updateProfile = useUpdateProfile();

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || "");
      setBio(profile.bio || "");
      setAvatarUrl(profile.avatarUrl || "");
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({ displayName, bio, avatarUrl });
      toast.success("Profile updated!");
    } catch {
      toast.error("Failed to update profile");
    }
  };

  const copyPrincipal = () => {
    navigator.clipboard.writeText(principal).catch(() => {});
    toast.success("Principal copied!");
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
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-start gap-5">
              <Avatar className="w-20 h-20">
                {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
                <AvatarFallback className="bg-primary/20 text-primary text-xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-foreground truncate">
                  {displayName || "Unnamed User"}
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
                <div className="flex items-center gap-2 mt-3">
                  <p className="text-xs font-mono text-muted-foreground truncate max-w-[200px]">
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
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
            <h3 className="font-semibold text-foreground">Edit Profile</h3>

            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-foreground">
                Display Name
              </Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your display name"
                className="bg-input border-border"
                data-ocid="profile.input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-foreground">
                Bio
              </Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell something about yourself..."
                className="bg-input border-border resize-none min-h-[100px]"
                data-ocid="profile.textarea"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatarUrl" className="text-foreground">
                Avatar URL
              </Label>
              <Input
                id="avatarUrl"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="bg-input border-border"
              />
            </div>

            <Button
              className="w-full bg-primary hover:bg-accent text-primary-foreground"
              onClick={handleSave}
              disabled={updateProfile.isPending}
              data-ocid="profile.save_button"
            >
              {updateProfile.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" /> Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
