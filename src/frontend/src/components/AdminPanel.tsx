import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  CheckCircle,
  Crown,
  PenSquare,
  Shield,
  Users,
} from "lucide-react";
import { useState } from "react";
import { PostType } from "../backend";
import { useAllPosts, useIsAdmin } from "../hooks/useQueries";
import {
  type TitanRole,
  getRoleBadgeStyle,
  getRoleLabel,
} from "../lib/titanRole";
import { CreatePostModal } from "./CreatePostModal";

interface AdminPanelProps {
  role: TitanRole;
}

export function AdminPanel({ role }: AdminPanelProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const { data: posts = [] } = useAllPosts();
  const { data: isAdmin } = useIsAdmin();

  const importantCount = posts.filter(
    (p) => p.postType === PostType.important,
  ).length;
  const dailyCount = posts.filter((p) => p.postType === PostType.daily).length;

  return (
    <div className="max-w-2xl mx-auto w-full" data-ocid="admin.section">
      <h1 className="text-3xl font-bold text-foreground mb-6">Admin Panel</h1>

      {/* Role Card */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-4">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
              role === "owner" ? "bg-amber-500/20" : "bg-primary/20"
            }`}
          >
            {role === "owner" ? (
              <Crown className="w-7 h-7 text-amber-400" />
            ) : (
              <Shield className="w-7 h-7 text-primary" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-foreground">
                {getRoleLabel(role)} Access
              </h2>
              <Badge className={`text-xs ${getRoleBadgeStyle(role)}`}>
                {getRoleLabel(role)}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm">
              You have elevated privileges. You can create posts and manage
              content.
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-muted/20 border border-border">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span className="text-sm text-foreground">
            Backend admin status:{" "}
            <span
              className={isAdmin ? "text-emerald-400" : "text-muted-foreground"}
            >
              {isAdmin ? "Verified" : "Pending"}
            </span>
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground font-medium">
              Important Posts
            </span>
          </div>
          <p className="text-3xl font-bold text-foreground">{importantCount}</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
              <Users className="w-5 h-5 text-muted-foreground" />
            </div>
            <span className="text-sm text-muted-foreground font-medium">
              Daily Posts
            </span>
          </div>
          <p className="text-3xl font-bold text-foreground">{dailyCount}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-semibold text-foreground mb-4">
          Content Management
        </h3>
        <Button
          className="w-full bg-primary hover:bg-accent text-primary-foreground gap-2"
          onClick={() => setCreateOpen(true)}
          data-ocid="admin.open_modal_button"
        >
          <PenSquare className="w-4 h-4" />
          Create New Post
        </Button>
      </div>

      <CreatePostModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
