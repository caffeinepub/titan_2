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
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, Calendar, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PostType } from "../backend";
import { useCreatePost } from "../hooks/useQueries";

interface CreatePostModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreatePostModal({ open, onClose }: CreatePostModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState<PostType>(PostType.daily);
  const createPost = useCreatePost();

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    try {
      await createPost.mutateAsync({
        title: title.trim(),
        content: content.trim(),
        postType,
      });
      toast.success("Post published!");
      setTitle("");
      setContent("");
      setPostType(PostType.daily);
      onClose();
    } catch {
      toast.error("Failed to create post");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="bg-card border-border max-w-lg"
        data-ocid="create_post.dialog"
      >
        <DialogHeader>
          <DialogTitle className="text-foreground text-lg font-bold">
            Create New Post
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Post Type Selector */}
          <div className="space-y-2">
            <Label className="text-foreground text-sm font-medium">
              Post Type
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  postType === PostType.important
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-muted/20 text-muted-foreground hover:border-border/80"
                }`}
                onClick={() => setPostType(PostType.important)}
                data-ocid="create_post.important_toggle"
              >
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <div className="text-left">
                  <p className="font-semibold text-sm">Important</p>
                  <p className="text-xs opacity-70">Priority update</p>
                </div>
              </button>
              <button
                type="button"
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  postType === PostType.daily
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-muted/20 text-muted-foreground hover:border-border/80"
                }`}
                onClick={() => setPostType(PostType.daily)}
                data-ocid="create_post.daily_toggle"
              >
                <Calendar className="w-5 h-5 flex-shrink-0" />
                <div className="text-left">
                  <p className="font-semibold text-sm">Daily</p>
                  <p className="text-xs opacity-70">Regular update</p>
                </div>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="post-title" className="text-foreground">
              Title
            </Label>
            <Input
              id="post-title"
              placeholder="Post title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-input border-border"
              data-ocid="create_post.input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="post-content" className="text-foreground">
              Content
            </Label>
            <Textarea
              id="post-content"
              placeholder="What's happening..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="bg-input border-border min-h-[120px] resize-none"
              data-ocid="create_post.textarea"
            />
          </div>

          {postType === PostType.important && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/10 border border-primary/30">
              <AlertTriangle className="w-4 h-4 text-primary flex-shrink-0" />
              <p className="text-sm text-primary">
                This will be highlighted as an Important Update
              </p>
              <Badge className="ml-auto bg-primary/20 text-primary border-primary/30 text-xs">
                Priority
              </Badge>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1 border-border"
              onClick={onClose}
              data-ocid="create_post.cancel_button"
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-primary hover:bg-accent text-primary-foreground"
              onClick={handleSubmit}
              disabled={createPost.isPending}
              data-ocid="create_post.submit_button"
            >
              {createPost.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                  Publishing...
                </>
              ) : (
                "Publish Post"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
