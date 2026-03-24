import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface Comment {
    id: bigint;
    content: string;
    author: Principal;
    timestamp: Time;
    postId: bigint;
}
export interface Message {
    id: bigint;
    content: string;
    recipient: Principal;
    sender: Principal;
    timestamp: Time;
}
export interface PostView {
    id: bigint;
    postType: PostType;
    title: string;
    content: string;
    author: Principal;
    likes: Array<Principal>;
    timestamp: Time;
}
export interface UserProfile {
    bio: string;
    displayName: string;
    avatarUrl: string;
}
export enum PostType {
    important = "important",
    daily = "daily"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addComment(postId: bigint, content: string): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createPost(title: string, content: string, postType: PostType): Promise<bigint>;
    getAllPosts(): Promise<Array<PostView>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getComments(postId: bigint): Promise<Array<Comment>>;
    getConversation(withUser: Principal): Promise<Array<Message>>;
    getImportantPosts(): Promise<Array<PostView>>;
    getPost(postId: bigint): Promise<PostView>;
    getProfileId(user: Principal): Promise<UserProfile>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchPosts(keyword: string): Promise<Array<PostView>>;
    sendMessage(recipient: Principal, content: string): Promise<bigint>;
    updateProfile(displayName: string, bio: string, avatarUrl: string): Promise<void>;
}
