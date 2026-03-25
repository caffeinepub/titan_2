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
  ImagePlus,
  Loader2,
  RefreshCw,
  WifiOff,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { PostType } from "../backend";
import { useBackendStatus, useCreatePost } from "../hooks/useQueries";
import { useStorageUpload } from "../hooks/useStorageUpload";

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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createPost = useCreatePost();
  const {
    data: backendOnline,
    refetch: retryBackendCheck,
    isFetching: isCheckingBackend,
  } = useBackendStatus();
  const { uploadImage, isUploading, uploadError } = useStorageUpload();

  const isBackendOffline = backendOnline === false;
  const isTemporarilyUnavailable =
    submitError?.includes("temporarily unavailable") ?? false;

  useEffect(() => {
    if (backendOnline === true && isTemporarilyUnavailable) {
      setSubmitError(null);
    }
  }, [backendOnline, isTemporarilyUnavailable]);

  // Show upload error in the submit error area
  useEffect(() => {
    if (uploadError) {
      setSubmitError(uploadError);
    }
  }, [uploadError]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!(["image/jpeg", "image/png"] as string[]).includes(file.type)) {
      setSubmitError("Only JPG and PNG images are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setSubmitError("Image must be under 5MB.");
      return;
    }
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setSubmitError(null);
    // reset input so same file can be re-selected after removal
    e.target.value = "";
  };

  const handleRemoveImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
    setUploadProgress(0);
  };

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

    let resolvedImageUrl: string | null = null;
    if (imageFile) {
      try {
        resolvedImageUrl = await uploadImage(imageFile, (pct) =>
          setUploadProgress(pct),
        );
      } catch {
        // uploadError is surfaced via the useEffect above
        return;
      }
    }

    try {
      await createPost.mutateAsync({
        title: title.trim(),
        content: content.trim(),
        postType,
        imageUrl: resolvedImageUrl,
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
    handleRemoveImage();
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
    handleRemoveImage();
    onClose();
  };

  const isCountingDown = retryCountdown !== null;
  // Submit is only disabled during active operations, not due to backend status
  const isSubmitDisabled =
    createPost.isPending || isCountingDown || isUploading;

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
          {/* Backend offline warning banner */}
          {isBackendOffline && (
            <div
              className="flex items-start gap-2 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30"
              data-ocid="create_post.error_state"
            >
              <WifiOff className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-500 flex-1">
                Server is down, retrying...
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

          {/* Image Upload Section */}
          <div className="space-y-2">
            <Label className="text-foreground text-sm font-medium">Photo</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              className="hidden"
              onChange={handleFileChange}
              data-ocid="create_post.upload_button"
            />

            {!imagePreview ? (
              <button
                type="button"
                className="w-full flex flex-col items-center justify-center gap-2 p-5 rounded-xl border border-dashed border-border bg-muted/30 text-muted-foreground hover:text-foreground hover:border-border/70 hover:bg-muted/50 transition-all"
                onClick={() => fileInputRef.current?.click()}
                data-ocid="create_post.dropzone"
              >
                <ImagePlus className="w-6 h-6" />
                <span className="text-sm">Add Photo</span>
                <span className="text-xs opacity-60">JPG or PNG · max 5MB</span>
              </button>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-border">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-48 w-full object-cover rounded-xl"
                />
                {/* Upload progress overlay */}
                {isUploading && (
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 rounded-xl">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                    <span className="text-white text-sm font-medium">
                      Uploading... {uploadProgress}%
                    </span>
                    <div className="w-2/3 h-1.5 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
                {/* Action buttons */}
                {!isUploading && (
                  <div className="absolute top-2 right-2 flex gap-1.5">
                    <button
                      type="button"
                      className="w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                      title="Change image"
                      data-ocid="create_post.edit_button"
                    >
                      <ImagePlus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      className="w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-red-500/80 transition-colors"
                      onClick={handleRemoveImage}
                      title="Remove image"
                      data-ocid="create_post.delete_button"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}
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
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading {uploadProgress}%...
                </>
              ) : createPost.isPending ? (
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
