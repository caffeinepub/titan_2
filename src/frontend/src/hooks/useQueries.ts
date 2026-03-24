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

export function useAllPosts() {
  const { actor, isFetching } = useActor();
  return useQuery<PostView[]>({
    queryKey: ["posts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPosts();
    },
    enabled: !!actor && !isFetching,
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

export function useCreatePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      content,
      postType,
    }: { title: string; content: string; postType: PostType }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createPost(title, content, postType);
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
