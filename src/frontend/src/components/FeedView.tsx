import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Plus, RefreshCw, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PostType } from "../backend";
import { useAllPosts, useSearchPosts } from "../hooks/useQueries";
import { type TitanRole, canPost } from "../lib/titanRole";
import { CreatePostModal } from "./CreatePostModal";
import { PostCard } from "./PostCard";

type FilterType = "all" | "important" | "daily";

interface FeedViewProps {
  role: TitanRole;
}

export function FeedView({ role }: FeedViewProps) {
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDebouncedSearch(searchInput), 400);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [searchInput]);

  const { data: allPosts = [], isLoading, refetch } = useAllPosts();
  const { data: searchResults = [], isLoading: searchLoading } =
    useSearchPosts(debouncedSearch);

  const isSearching = debouncedSearch.trim().length > 0;
  const rawPosts = isSearching ? searchResults : allPosts;

  const filteredPosts = rawPosts.filter((p) => {
    if (filter === "important") return p.postType === PostType.important;
    if (filter === "daily") return p.postType === PostType.daily;
    return true;
  });

  const importantPosts = filteredPosts.filter(
    (p) => p.postType === PostType.important,
  );
  const dailyPosts = filteredPosts.filter((p) => p.postType === PostType.daily);
  const loading = isLoading || searchLoading;

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["userRoleLabel"] });
    refetch();
  };

  return (
    <div className="max-w-2xl mx-auto w-full" data-ocid="feed.section">
      {/* Header row — wraps on small screens */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <h1 className="text-3xl font-bold text-foreground mr-auto">Feed</h1>
        <div className="flex items-center gap-2 min-w-0">
          <div className="relative min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search Titan…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9 bg-input border-border w-40 sm:w-48 md:w-64 text-sm"
              data-ocid="feed.search_input"
            />
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="border-border text-muted-foreground hover:text-foreground flex-shrink-0"
            onClick={handleRefresh}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          {canPost(role) && (
            <button
              type="button"
              className="w-9 h-9 rounded-full bg-primary hover:bg-accent text-primary-foreground flex items-center justify-center transition-colors shadow-glow flex-shrink-0"
              onClick={() => setCreateOpen(true)}
              data-ocid="feed.open_modal_button"
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter tabs — wrap on small screens */}
      <div className="flex flex-wrap gap-2 mb-6" data-ocid="feed.tab">
        {(["all", "important", "daily"] as FilterType[]).map((f) => (
          <button
            type="button"
            key={f}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors capitalize ${
              filter === f
                ? "bg-primary text-primary-foreground"
                : "bg-muted/40 text-muted-foreground hover:bg-muted/70"
            }`}
            onClick={() => setFilter(f)}
          >
            {f === "all"
              ? "All Posts"
              : f === "important"
                ? "Important"
                : "Daily"}
          </button>
        ))}
      </div>

      {loading && (
        <div className="space-y-4" data-ocid="feed.loading_state">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-40 rounded-2xl bg-muted/30 animate-pulse"
            />
          ))}
        </div>
      )}

      {!loading && filteredPosts.length === 0 && (
        <div className="text-center py-16" data-ocid="feed.empty_state">
          <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">
            {isSearching ? "No posts match your search" : "No posts yet"}
          </p>
        </div>
      )}

      {!loading && importantPosts.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4 px-4 py-3 rounded-xl bg-gradient-to-r from-[oklch(0.28_0.12_264)] to-[oklch(0.35_0.18_264)] border border-primary/30">
            <AlertTriangle className="w-5 h-5 text-primary flex-shrink-0" />
            <h2 className="font-bold text-foreground text-base min-w-0 truncate">
              Important Updates
            </h2>
            <Badge className="ml-auto bg-primary/20 text-primary border-primary/30 flex-shrink-0">
              {importantPosts.length}
            </Badge>
          </div>
          <div className="space-y-5">
            {importantPosts.map((post, i) => (
              <PostCard key={post.id.toString()} post={post} index={i + 1} />
            ))}
          </div>
        </section>
      )}

      {!loading &&
        (filter === "all" || filter === "daily") &&
        dailyPosts.length > 0 && (
          <section>
            {filter === "all" && importantPosts.length > 0 && (
              <h2 className="font-semibold text-foreground text-base mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-muted-foreground inline-block" />
                Daily Updates
              </h2>
            )}
            <div className="space-y-5">
              {dailyPosts.map((post, i) => (
                <PostCard
                  key={post.id.toString()}
                  post={post}
                  index={importantPosts.length + i + 1}
                />
              ))}
            </div>
          </section>
        )}

      <CreatePostModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
