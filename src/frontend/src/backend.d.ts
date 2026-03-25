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
export interface User {
    id: bigint;
    age: bigint;
    username: string;
    gmail: string;
    registrationTime: Time;
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
export interface RegistrationData {
    age: bigint;
    username: string;
    gmail: string;
}
export interface Message {
    id: bigint;
    content: string;
    recipient: Principal;
    sender: Principal;
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
export enum RegistrationResult {
    invalidEmail = "invalidEmail",
    other = "other",
    usernameAlreadyExists = "usernameAlreadyExists",
    registrationSuccessful = "registrationSuccessful"
}
export enum AccessKeyResult {
    owner = "owner",
    admin = "admin",
    invalid = "invalid"
}
export declare const createActor: () => {
    assignCallerUserRole: (principal: Principal, role: UserRole) => Promise<void>;
    verifyAccessKey: (key: string) => Promise<AccessKeyResult>;
    registerUser: (data: RegistrationData) => Promise<RegistrationResult>;
    checkUsernameAvailability: (username: string) => Promise<boolean>;
    getUsers: () => Promise<User[]>;
    createPost: (title: string, content: string, postType: PostType) => Promise<bigint>;
    getPost: (postId: bigint) => Promise<PostView>;
    getAllPosts: () => Promise<PostView[]>;
    getRecentPosts: () => Promise<PostView[]>;
    getImportantPosts: () => Promise<PostView[]>;
    getPostsByUser: (user: Principal) => Promise<PostView[]>;
    deletePost: (postId: bigint) => Promise<void>;
    updatePost: (postId: bigint, title: string, content: string, postType: PostType) => Promise<void>;
    likePost: (postId: bigint) => Promise<void>;
    getPostLikes: (postId: bigint) => Promise<Principal[]>;
    searchPosts: (keyword: string) => Promise<PostView[]>;
    addComment: (postId: bigint, content: string) => Promise<bigint>;
    getComments: (postId: bigint) => Promise<Comment[]>;
    deleteComment: (commentId: bigint) => Promise<void>;
    updateComment: (commentId: bigint, content: string) => Promise<void>;
    sendMessage: (recipient: Principal, content: string) => Promise<bigint>;
    getConversation: (withUser: Principal) => Promise<Message[]>;
    getCallerUserProfile: () => Promise<UserProfile | null>;
    getUserProfile: (user: Principal) => Promise<UserProfile | null>;
    saveCallerUserProfile: (profile: UserProfile) => Promise<void>;
    updateProfile: (displayName: string, bio: string, avatarUrl: string) => Promise<void>;
    getProfileId: (user: Principal) => Promise<UserProfile>;
};
export declare const UserRole: { readonly owner: "owner"; readonly admin: "admin"; readonly user: "user" };
export type UserRole = (typeof UserRole)[keyof typeof UserRole];
