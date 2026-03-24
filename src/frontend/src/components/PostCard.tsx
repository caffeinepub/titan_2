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
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { PostView } from "../backend";
import { PostType } from "../backend";
import { useAddComment, useComments } from "../hooks/useQueries";
import { formatRelativeTime, getInitials } from "../lib/utils";

interface PostCardProps {
  post: PostView;
  index: number;
}

export function PostCard({ post, index }: PostCardProps) {
  const [liked, setLiked] = useState(false);
  const [localLikes, setLocalLikes] = useState(post.likes.length);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const isImportant = post.postType === PostType.important;
  const authorStr = post.author.toString();
  const shortAuthor = `${authorStr.slice(0, 5)}...${authorStr.slice(-3)}`;

  const { data: comments = [], isLoading: commentsLoading } = useComments(
    post.id,
    showComments,
  );
  const addComment = useAddComment();

  const handleLike = () => {
    setLiked(!liked);
    setLocalLikes((prev) => (liked ? prev - 1 : prev + 1));
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

  return (
    <article
      className={`rounded-2xl border shadow-card animate-fade-in ${
        isImportant
          ? "border-primary/40 bg-gradient-to-br from-[oklch(0.28_0.12_264)] to-[oklch(0.17_0.007_264)]"
          : "border-border bg-card"
      }`}
      data-ocid={`feed.item.${index}`}
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
              {getInitials(shortAuthor)}
            </div>
            <div>
              <span className="font-semibold text-foreground text-sm">
                {shortAuthor}
              </span>
              <br />
              <span className="text-xs text-muted-foreground">
                {formatRelativeTime(post.timestamp)}
              </span>
            </div>
          </div>
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
                Important Update
              </>
            ) : (
              "Daily Update"
            )}
          </Badge>
        </div>

        <div className="mb-4">
          <h3 className="font-bold text-foreground text-base mb-2 leading-snug">
            {post.title}
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {post.content}
          </p>
        </div>

        <div className="flex items-center gap-1 pt-3 border-t border-border/50">
          <button
            type="button"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
              liked
                ? "text-rose-400 bg-rose-400/10"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
            }`}
            onClick={handleLike}
            data-ocid={`feed.item.${index}.toggle`}
          >
            <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
            <span>{localLikes}</span>
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
            onClick={() => setShowComments(!showComments)}
            data-ocid={`feed.item.${index}.button`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>{comments.length > 0 ? comments.length : "Comment"}</span>
            {showComments ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors ml-auto"
            onClick={handleShare}
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showComments && (
        <div className="border-t border-border/50 p-5 space-y-4">
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
              <div className="flex-1 bg-muted/30 rounded-xl px-3 py-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-foreground">
                    {`${comment.author.toString().slice(0, 5)}...`}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatRelativeTime(comment.timestamp)}
                  </span>
                </div>
                <p className="text-sm text-foreground">{comment.content}</p>
              </div>
            </div>
          ))}

          <div className="flex gap-2">
            <Input
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleComment()}
              className="bg-input border-border text-sm"
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
  );
}
