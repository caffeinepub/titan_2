import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Heart,
  MessageCircle,
  Send,
  Share2,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { PostView } from "../backend";
import { PostType } from "../backend";
import {
  useAddComment,
  useComments,
  useDeletePost,
  useLikePost,
} from "../hooks/useQueries";
import { getTitanRole } from "../lib/titanRole";
import { formatRelativeTime, getInitials } from "../lib/titanUtils";

interface PostCardProps {
  post: PostView;
  index: number;
}

export function PostCard({ post, index }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isImportant = post.postType === PostType.important;
  const authorStr = post.author.toString();
  const shortAuthor = `${authorStr.slice(0, 5)}...${authorStr.slice(-3)}`;

  const currentRole = getTitanRole();
  const isOwner = currentRole === "owner";

  const { data: comments = [], isLoading: commentsLoading } = useComments(
    post.id,
    showComments,
  );
  const addComment = useAddComment();
  const likePost = useLikePost();
  const deletePost = useDeletePost();

  const likesCount = post.likes.length;

  const handleLike = async () => {
    try {
      await likePost.mutateAsync({ postId: post.id });
    } catch {
      toast.error("Failed to like post");
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    try {
      await addComment.mutateAsync({
        postId: post.id,
        content: commentText.trim(),
      });
      setCommentText("");
      toast.success("Comment added");
    } catch {
      toast.error("Failed to add comment");
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).catch(() => {});
    toast.success("Link copied!");
  };

  const handleDeleteConfirm = async () => {
    try {
      await deletePost.mutateAsync({ postId: post.id });
      toast.success("Post deleted");
      setConfirmDelete(false);
    } catch {
      toast.error("Failed to delete post");
    }
  };

  return (
    <>
      {/* Confirmation overlay */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/15 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="font-bold text-foreground text-base">
                Delete Post
              </h3>
            </div>
            <p className="text-muted-foreground text-sm mb-6">
              Are you sure you want to delete this post? This action cannot be
              undone.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-border"
                onClick={() => setConfirmDelete(false)}
                disabled={deletePost.isPending}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                onClick={handleDeleteConfirm}
                disabled={deletePost.isPending}
              >
                {deletePost.isPending ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <article
        className={`rounded-2xl border shadow-card animate-fade-in ${
          isImportant
            ? "border-primary/40 bg-gradient-to-br from-[oklch(0.28_0.12_264)] to-[oklch(0.17_0.007_264)]"
            : "border-border bg-card"
        }`}
        data-ocid={`feed.item.${index}`}
      >
        <div className="p-4 sm:p-5">
          <div className="flex items-start justify-between mb-4 gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                {getInitials(shortAuthor)}
              </div>
              <div className="min-w-0">
                <span className="font-semibold text-foreground text-sm truncate block">
                  {shortAuthor}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatRelativeTime(post.timestamp)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge
                className={`text-xs ${
                  isImportant
                    ? "bg-primary/20 text-primary border-primary/40"
                    : "bg-muted text-muted-foreground border-border"
                }`}
              >
                {isImportant ? (
                  <>
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    <span className="hidden sm:inline">Important Update</span>
                    <span className="sm:hidden">Important</span>
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline">Daily Update</span>
                    <span className="sm:hidden">Daily</span>
                  </>
                )}
              </Badge>
              {isOwner && (
                <button
                  type="button"
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors"
                  onClick={() => setConfirmDelete(true)}
                  title="Delete post"
                  aria-label="Delete post"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="mb-4">
            <h3 className="font-bold text-foreground text-base mb-2 leading-snug">
              {post.title}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {post.content}
            </p>
          </div>

          <div className="flex items-center gap-1 pt-3 border-t border-border/50 flex-wrap">
            <button
              type="button"
              className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-sm transition-colors ${
                likePost.isPending
                  ? "opacity-60 cursor-wait text-rose-400 bg-rose-400/10"
                  : "text-muted-foreground hover:text-rose-400 hover:bg-rose-400/10"
              }`}
              onClick={handleLike}
              disabled={likePost.isPending}
              data-ocid={`feed.item.${index}.toggle`}
            >
              <Heart className="w-4 h-4" />
              <span>{likesCount}</span>
            </button>
            <button
              type="button"
              className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
              onClick={() => setShowComments(!showComments)}
              data-ocid={`feed.item.${index}.button`}
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden xs:inline">
                {comments.length > 0 ? comments.length : "Comment"}
              </span>
              {showComments ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>
            <button
              type="button"
              className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors ml-auto"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {showComments && (
          <div className="border-t border-border/50 p-4 sm:p-5 space-y-4">
            {commentsLoading && (
              <div
                className="text-center text-muted-foreground text-sm py-2"
                data-ocid={`feed.item.${index}.loading_state`}
              >
                Loading comments...
              </div>
            )}
            {!commentsLoading && comments.length === 0 && (
              <div
                className="text-center text-muted-foreground text-sm py-2"
                data-ocid={`feed.item.${index}.empty_state`}
              >
                No comments yet. Be the first!
              </div>
            )}
            {comments.map((comment) => (
              <div
                key={comment.id.toString()}
                className="flex gap-3"
                data-ocid={`feed.item.${index}.row`}
              >
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground flex-shrink-0">
                  {getInitials(comment.author.toString().slice(0, 5))}
                </div>
                <div className="flex-1 min-w-0 bg-muted/30 rounded-xl px-3 py-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-foreground">
                      {`${comment.author.toString().slice(0, 5)}...`}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeTime(comment.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-foreground break-words">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))}

            <div className="flex gap-2">
              <Input
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleComment()}
                className="bg-input border-border text-sm min-w-0"
                data-ocid={`feed.item.${index}.input`}
              />
              <Button
                size="sm"
                className="bg-primary hover:bg-accent text-primary-foreground px-3 flex-shrink-0"
                onClick={handleComment}
                disabled={addComment.isPending || !commentText.trim()}
                data-ocid={`feed.item.${index}.submit_button`}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </article>
    </>
  );
}
