import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Map "mo:core/Map";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Set "mo:core/Set";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Int "mo:core/Int";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  module Post {
    public func compare(p1 : Post, p2 : Post) : Order.Order {
      Int.compare(p2.timestamp, p1.timestamp);
    };
  };

  // Types
  type PostType = {
    #important;
    #daily;
  };

  type Post = {
    id : Nat;
    title : Text;
    content : Text;
    postType : PostType;
    author : Principal;
    timestamp : Time.Time;
    likes : Set.Set<Principal>;
  };

  type PostView = {
    id : Nat;
    title : Text;
    content : Text;
    postType : PostType;
    author : Principal;
    timestamp : Time.Time;
    likes : [Principal];
  };

  type Comment = {
    id : Nat;
    postId : Nat;
    content : Text;
    author : Principal;
    timestamp : Time.Time;
  };

  type Message = {
    id : Nat;
    sender : Principal;
    recipient : Principal;
    content : Text;
    timestamp : Time.Time;
  };

  type UserProfile = {
    displayName : Text;
    bio : Text;
    avatarUrl : Text;
  };

  // Persistent state
  var nextPostId = 0;
  var nextCommentId = 0;
  var nextMessageId = 0;

  let posts = Map.empty<Nat, Post>();
  let comments = Map.empty<Nat, Comment>();
  let messages = Map.empty<Nat, Message>();
  let profiles = Map.empty<Principal, UserProfile>();

  // Post Management
  public shared ({ caller }) func createPost(title : Text, content : Text, postType : PostType) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create posts");
    };

    let postId = nextPostId;
    nextPostId += 1;

    let post : Post = {
      id = postId;
      title;
      content;
      postType;
      author = caller;
      timestamp = Time.now();
      likes = Set.empty<Principal>();
    };

    posts.add(postId, post);
    postId;
  };

  public query ({ caller }) func getPost(postId : Nat) : async PostView {
    switch (posts.get(postId)) {
      case (?post) {
        archivePost(post);
      };
      case (null) { Runtime.trap("Post not found") };
    };
  };

  func archivePost(post : Post) : PostView {
    {
      id = post.id;
      title = post.title;
      content = post.content;
      postType = post.postType;
      author = post.author;
      timestamp = post.timestamp;
      likes = post.likes.toArray();
    };
  };

  public query ({ caller }) func getAllPosts() : async [PostView] {
    posts.values().map(archivePost).toArray();
  };

  public query ({ caller }) func getImportantPosts() : async [PostView] {
    posts.values().map(archivePost).toArray().filter(
      func(p) {
        switch (p.postType) {
          case (#important) { true };
          case (#daily) { false };
        };
      }
    );
  };

  // Comment Management
  public shared ({ caller }) func addComment(postId : Nat, content : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add comments");
    };

    switch (posts.get(postId)) {
      case (null) {
        Runtime.trap("Post not found");
      };
      case (_) {};
    };

    let commentId = nextCommentId;
    nextCommentId += 1;

    let comment : Comment = {
      id = commentId;
      postId;
      content;
      author = caller;
      timestamp = Time.now();
    };

    comments.add(commentId, comment);
    commentId;
  };

  public query ({ caller }) func getComments(postId : Nat) : async [Comment] {
    comments.values().toArray().filter(func(c) { c.postId == postId });
  };

  // Messaging
  public shared ({ caller }) func sendMessage(recipient : Principal, content : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send messages");
    };

    let messageId = nextMessageId;
    nextMessageId += 1;

    let message : Message = {
      id = messageId;
      sender = caller;
      recipient;
      content;
      timestamp = Time.now();
    };

    messages.add(messageId, message);
    messageId;
  };

  public query ({ caller }) func getConversation(withUser : Principal) : async [Message] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get conversations");
    };

    messages.values().toArray().filter(
      func(m) {
        (m.sender == caller and m.recipient == withUser) or (m.sender == withUser and m.recipient == caller);
      }
    );
  };

  // Profile Management - Required interface functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    profiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    profiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    profiles.add(caller, profile);
  };

  // Legacy profile update function (keeping for backward compatibility)
  public shared ({ caller }) func updateProfile(displayName : Text, bio : Text, avatarUrl : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update profile");
    };

    let profile : UserProfile = {
      displayName;
      bio;
      avatarUrl;
    };

    profiles.add(caller, profile);
  };

  // Legacy profile getter (keeping for backward compatibility)
  public query ({ caller }) func getProfileId(user : Principal) : async UserProfile {
    switch (profiles.get(user)) {
      case (?profile) { profile };
      case (null) { Runtime.trap("Profile not found") };
    };
  };

  // Search
  public query ({ caller }) func searchPosts(keyword : Text) : async [PostView] {
    posts.values().toArray().map(
      func(p) {
        archivePost(p);
      }
    ).filter(
      func(p) {
        p.title.contains(#text keyword) or p.content.contains(#text keyword);
      }
    );
  };
};
