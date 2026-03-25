import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Comment,
  Message,
  PostType,
  PostView,
  UserProfile,
} from "../backend";
import { embedPostImage } from "../lib/postImage";
import { useActor } from "./useActor";

function isCanisterStoppedError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes("IC0508") ||
    msg.toLowerCase().includes("canister is stopped") ||
    msg.toLowerCase().includes("canister stopped")
  );
}

export function useAllPosts() {
  const { actor, isFetching } = useActor();
  return useQuery<PostView[]>({
    queryKey: ["posts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPosts();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000,
  });
}

export function useSearchPosts(keyword: string) {
  const { actor, isFetching } = useActor();
  return useQuery<PostView[]>({
    queryKey: ["posts", "search", keyword],
    queryFn: async () => {
      if (!actor || !keyword.trim()) return [];
      return actor.searchPosts(keyword);
    },
    enabled: !!actor && !isFetching && keyword.trim().length > 0,
    refetchInterval: 5000,
  });
}

export function useComments(postId: bigint, enabled: boolean) {
  const { actor, isFetching } = useActor();
  return useQuery<Comment[]>({
    queryKey: ["comments", postId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getComments(postId);
    },
    enabled: !!actor && !isFetching && enabled,
    refetchInterval: enabled ? 3000 : false,
  });
}

export function useConversation(withUser: Principal | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Message[]>({
    queryKey: ["conversation", withUser?.toString()],
    queryFn: async () => {
      if (!actor || !withUser) return [];
      return actor.getConversation(withUser);
    },
    enabled: !!actor && !isFetching && !!withUser,
    refetchInterval: 3000,
  });
}

export function useCallerProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["callerProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useBackendStatus() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["backendStatus"],
    queryFn: async () => {
      if (!actor) return false;
      try {
        await actor.getAllPosts();
        return true;
      } catch (err) {
        console.error("[Titan Backend Health Check]", err);
        if (isCanisterStoppedError(err)) return false;
        return true; // other errors don't mean canister is stopped
      }
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000,
    retry: false,
  });
}

export function useCreatePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      content,
      postType,
      imageUrl,
    }: {
      title: string;
      content: string;
      postType: PostType;
      imageUrl?: string | null;
    }) => {
      if (!actor) throw new Error("Not connected");
      const finalContent = imageUrl
        ? embedPostImage(content, imageUrl)
        : content;
      try {
        return await actor.createPost(title, finalContent, postType);
      } catch (err) {
        console.error("[Titan Backend Error]", err);
        if (isCanisterStoppedError(err)) {
          throw new Error(
            "Server is temporarily unavailable. Please try again later.",
          );
        }
        throw err;
      }
    },
    retry: 2,
    retryDelay: (attempt) => attempt * 2000,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

export function useDeletePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ postId }: { postId: bigint }) => {
      if (!actor) throw new Error("Not connected");
      return actor.deletePost(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

export function useAddComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      postId,
      content,
    }: { postId: bigint; content: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addComment(postId, content);
    },
    onSuccess: (_data, { postId }) => {
      queryClient.invalidateQueries({
        queryKey: ["comments", postId.toString()],
      });
    },
  });
}

export function useLikePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ postId }: { postId: bigint }) => {
      if (!actor) throw new Error("Not connected");
      return actor.likePost(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      recipient,
      content,
    }: { recipient: Principal; content: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.sendMessage(recipient, content);
    },
    onSuccess: (_data, { recipient }) => {
      queryClient.invalidateQueries({
        queryKey: ["conversation", recipient.toString()],
      });
    },
  });
}

export function useUpdateProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      displayName,
      bio,
      avatarUrl,
    }: { displayName: string; bio: string; avatarUrl: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateProfile(displayName, bio, avatarUrl);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callerProfile"] });
    },
  });
}
