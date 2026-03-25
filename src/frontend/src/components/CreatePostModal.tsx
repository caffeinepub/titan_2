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
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  Loader2,
  RefreshCw,
  WifiOff,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { PostType } from "../backend";
import { useBackendStatus, useCreatePost } from "../hooks/useQueries";

interface CreatePostModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreatePostModal({ open, onClose }: CreatePostModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState<PostType>(PostType.daily);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [retryCountdown, setRetryCountdown] = useState<number | null>(null);
  const prevBackendOnlineRef = useRef<boolean | undefined>(undefined);
  const createPost = useCreatePost();
  const {
    data: backendOnline,
    refetch: retryBackendCheck,
    isFetching: isCheckingBackend,
  } = useBackendStatus();

  const isBackendOffline = backendOnline === false;
  const isTemporarilyUnavailable =
    submitError?.includes("temporarily unavailable") ?? false;

  // Clear errors when backend recovers
  useEffect(() => {
    const prev = prevBackendOnlineRef.current;
    prevBackendOnlineRef.current = backendOnline ?? undefined;

    if (backendOnline === true) {
      if (isTemporarilyUnavailable) {
        setSubmitError(null);
      }
      if (prev === false && submitError?.includes("Server is down")) {
        setSubmitError(null);
      }
    }
  }, [backendOnline, isTemporarilyUnavailable, submitError]);

  const handleSubmit = async () => {
    setSubmitError(null);
    setRetryCountdown(null);

    if (!title.trim()) {
      setSubmitError("Please enter a title.");
      return;
    }
    if (!content.trim()) {
      setSubmitError("Please enter some content.");
      return;
    }

    try {
      await createPost.mutateAsync({
        title: title.trim(),
        content: content.trim(),
        postType,
      });
      toast.success("Post published!");
      resetForm();
      onClose();
    } catch (err) {
      console.error("[CreatePost Error]", err);
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";
      setSubmitError(message);
      if (message.includes("temporarily unavailable")) {
        startRetryCountdown();
      }
    }
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setPostType(PostType.daily);
    setSubmitError(null);
  };

  const startRetryCountdown = () => {
    setRetryCountdown(3);
    const tick = (remaining: number) => {
      if (remaining <= 0) {
        setRetryCountdown(null);
        handleSubmit();
        return;
      }
      setTimeout(() => {
        setRetryCountdown(remaining - 1);
        tick(remaining - 1);
      }, 1000);
    };
    setTimeout(() => {
      setRetryCountdown(2);
      tick(2);
    }, 1000);
  };

  const handleClose = () => {
    setSubmitError(null);
    setRetryCountdown(null);
    onClose();
  };

  const isCountingDown = retryCountdown !== null;
  const isSubmitDisabled = createPost.isPending || isCountingDown;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent
        className="bg-card border-border w-[calc(100vw-2rem)] max-w-lg max-h-[90vh] overflow-y-auto"
        data-ocid="create_post.dialog"
      >
        <DialogHeader>
          <DialogTitle className="text-foreground text-lg font-bold">
            Create New Post
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Backend offline warning banner — informational only, does not block */}
          {isBackendOffline && (
            <div
              className="flex items-start gap-2 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30"
              data-ocid="create_post.error_state"
            >
              <WifiOff className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-500 flex-1">
                Server may be slow. You can still try posting.
              </p>
              <button
                type="button"
                onClick={() => retryBackendCheck()}
                disabled={isCheckingBackend}
                className="flex items-center gap-1 text-xs text-yellow-500 hover:text-yellow-400 font-medium flex-shrink-0 disabled:opacity-50"
                data-ocid="create_post.retry_button"
              >
                {isCheckingBackend ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <RefreshCw className="w-3 h-3" />
                )}
                Retry
              </button>
            </div>
          )}

          {/* Post Type Selector */}
          <div className="space-y-2">
            <Label className="text-foreground text-sm font-medium">
              Post Type
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className={`flex items-center gap-2 sm:gap-3 p-3 rounded-xl border transition-all ${
                  postType === PostType.important
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-muted/20 text-muted-foreground hover:border-border/80"
                }`}
                onClick={() => setPostType(PostType.important)}
                data-ocid="create_post.important_toggle"
              >
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <div className="text-left min-w-0">
                  <p className="font-semibold text-sm">Important</p>
                  <p className="text-xs opacity-70">Priority update</p>
                </div>
              </button>
              <button
                type="button"
                className={`flex items-center gap-2 sm:gap-3 p-3 rounded-xl border transition-all ${
                  postType === PostType.daily
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-muted/20 text-muted-foreground hover:border-border/80"
                }`}
                onClick={() => setPostType(PostType.daily)}
                data-ocid="create_post.daily_toggle"
              >
                <Calendar className="w-5 h-5 flex-shrink-0" />
                <div className="text-left min-w-0">
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
              onChange={(e) => {
                setTitle(e.target.value);
                if (submitError) setSubmitError(null);
              }}
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
              onChange={(e) => {
                setContent(e.target.value);
                if (submitError) setSubmitError(null);
              }}
              className="bg-input border-border min-h-[120px] resize-none"
              data-ocid="create_post.textarea"
            />
          </div>

          {postType === PostType.important && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/10 border border-primary/30 flex-wrap">
              <AlertTriangle className="w-4 h-4 text-primary flex-shrink-0" />
              <p className="text-sm text-primary flex-1 min-w-0">
                This will be highlighted as an Important Update
              </p>
              <Badge className="bg-primary/20 text-primary border-primary/30 text-xs flex-shrink-0">
                Priority
              </Badge>
            </div>
          )}

          {/* Error message with retry */}
          {submitError && (
            <div
              className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/30"
              data-ocid="create_post.error_state"
            >
              <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-destructive break-words">
                  {submitError}
                </p>
                {isCountingDown && (
                  <p className="text-xs text-destructive/70 mt-1">
                    Retrying in {retryCountdown}...
                  </p>
                )}
              </div>
              {!isTemporarilyUnavailable && (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="flex items-center gap-1 text-xs text-destructive hover:text-destructive/80 font-medium flex-shrink-0"
                  data-ocid="create_post.retry_button"
                >
                  <RefreshCw className="w-3 h-3" />
                  Retry
                </button>
              )}
              {isTemporarilyUnavailable && !isCountingDown && (
                <button
                  type="button"
                  onClick={startRetryCountdown}
                  className="flex items-center gap-1 text-xs text-destructive hover:text-destructive/80 font-medium flex-shrink-0"
                  data-ocid="create_post.retry_button"
                >
                  <RefreshCw className="w-3 h-3" />
                  Retry
                </button>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1 border-border"
              onClick={handleClose}
              data-ocid="create_post.cancel_button"
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-primary hover:bg-accent text-primary-foreground"
              onClick={handleSubmit}
              disabled={isSubmitDisabled}
              data-ocid="create_post.submit_button"
            >
              {createPost.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Publishing...
                </>
              ) : isCountingDown ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Retrying in {retryCountdown}...
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
