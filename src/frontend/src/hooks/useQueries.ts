import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Comment,
  Message,
  PostType,
  PostView,
  UserProfile,
} from "../backend";
import { useActor } from "./useActor";

function isCanisterStoppedError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes("IC0508") ||
    msg.toLowerCase().includes("canister is stopped") ||
    msg.toLowerCase().includes("canister stopped")
  );
}

type ActorWithRoles = {
  saveCallerRoleLabel: (role: string) => Promise<void>;
  getUserRoleLabel: (user: Principal) => Promise<string>;
};

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

export function useUserProfile(author: Principal | null) {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["userProfile", author?.toString()],
    queryFn: async () => {
      if (!actor || !author) return null;
      return actor.getUserProfile(author);
    },
    enabled: !!actor && !isFetching && !!author,
    staleTime: 60_000,
  });
}

export function useUserRoleLabel(author: Principal | null) {
  const { actor, isFetching } = useActor();
  return useQuery<string>({
    queryKey: ["userRoleLabel", author?.toString()],
    queryFn: async () => {
      if (!actor || !author) return "user";
      try {
        return await (actor as unknown as ActorWithRoles).getUserRoleLabel(
          author,
        );
      } catch {
        return "user";
      }
    },
    enabled: !!actor && !isFetching && !!author,
    refetchInterval: 10000,
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
      if (!actor) return true; // actor not ready = still loading, not offline
      try {
        await actor.getRecentPosts();
        return true;
      } catch (err) {
        console.error("[Titan Backend Health Check]", err);
        if (isCanisterStoppedError(err)) return false;
        return true; // other errors are not definitive proof backend is down
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
    }: {
      title: string;
      content: string;
      postType: PostType;
    }) => {
      if (!actor) throw new Error("Not connected");
      try {
        return await actor.createPost(title, content, postType);
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
      queryClient.invalidateQueries({ queryKey: ["userRoleLabel"] });
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
      queryClient.invalidateQueries({ queryKey: ["userRoleLabel"] });
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
      queryClient.invalidateQueries({ queryKey: ["userRoleLabel"] });
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

export function useSaveRoleLabel() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ role }: { role: string }) => {
      if (!actor) return;
      try {
        await (actor as unknown as ActorWithRoles).saveCallerRoleLabel(role);
      } catch (err) {
        console.warn("[RoleLabel] Failed to save role to backend:", err);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userRoleLabel"] });
    },
  });
}
