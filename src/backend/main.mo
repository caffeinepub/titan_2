import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Set "mo:core/Set";
import Nat "mo:core/Nat";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";


actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type PostType = { #important; #daily };

  type User = {
    id : Nat;
    username : Text;
    age : Nat;
    gmail : Text;
    registrationTime : Time.Time;
  };

  public type RegistrationData = { username : Text; age : Nat; gmail : Text };

  public type RegistrationResult = {
    #registrationSuccessful;
    #usernameAlreadyExists;
    #invalidEmail;
    #other;
  };

  public type AccessKeyResult = {
    #owner;
    #admin;
    #invalid;
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

  type UserProfile = { displayName : Text; bio : Text; avatarUrl : Text };

  var nextPostId = 0;
  var nextCommentId = 0;
  var nextMessageId = 0;
  var nextUserId = 1;

  let posts = Map.empty<Nat, Post>();
  let comments = Map.empty<Nat, Comment>();
  let messages = Map.empty<Nat, Message>();
  let profiles = Map.empty<Principal, UserProfile>();
  let users = Map.empty<Nat, User>();

  // Access Key Verification (secure backend check)
  public func verifyAccessKey(key : Text) : async AccessKeyResult {
    let trimmed = key.trim(#char ' ');
    if (trimmed == "titan2437") {
      return #owner;
    };
    if (trimmed == "admin24517") {
      return #admin;
    };
    #invalid;
  };

  // Registration
  public shared func registerUser(registration : RegistrationData) : async RegistrationResult {
    if (not registration.gmail.endsWith(#text "@gmail.com")) {
      return #invalidEmail;
    };
    if (registration.username.size() == 0) {
      return #other;
    };
    var usernameTaken = false;
    for (u in users.values()) {
      if (u.username == registration.username) {
        usernameTaken := true;
      };
    };
    if (usernameTaken) {
      return #usernameAlreadyExists;
    };
    let id = nextUserId;
    nextUserId += 1;
    users.add(id, {
      id;
      username = registration.username;
      age = registration.age;
      gmail = registration.gmail;
      registrationTime = Time.now();
    });
    #registrationSuccessful;
  };

  public query func checkUsernameAvailability(username : Text) : async Bool {
    var available = true;
    for (u in users.values()) {
      if (u.username == username) {
        available := false;
      };
    };
    available;
  };

  public query func getUsers() : async [User] {
    users.values().toArray();
  };

  // Post Management
  public shared ({ caller }) func createPost(title : Text, content : Text, postType : PostType) : async Nat {
    if (title.size() == 0) Runtime.trap("Title cannot be empty");
    if (content.size() == 0) Runtime.trap("Content cannot be empty");
    let postId = nextPostId;
    nextPostId += 1;
    posts.add(postId, {
      id = postId;
      title;
      content;
      postType;
      author = caller;
      timestamp = Time.now();
      likes = Set.empty<Principal>();
    });
    postId;
  };

  func archivePost(post : Post) : PostView {
    { id = post.id; title = post.title; content = post.content; postType = post.postType; author = post.author; timestamp = post.timestamp; likes = post.likes.toArray() };
  };

  public query func getPost(postId : Nat) : async PostView {
    switch (posts.get(postId)) {
      case (?post) { archivePost(post) };
      case (null) { Runtime.trap("Post not found") };
    };
  };

  public query func getAllPosts() : async [PostView] {
    posts.values().map(archivePost).toArray();
  };

  public query func getRecentPosts() : async [PostView] {
    posts.values().map(archivePost).toArray();
  };

  public query func getImportantPosts() : async [PostView] {
    posts.values()
      .filter(func(p : Post) : Bool {
        switch (p.postType) { case (#important) true; case (_) false };
      })
      .map(archivePost)
      .toArray();
  };

  public query func getPostsByUser(user : Principal) : async [PostView] {
    posts.values()
      .filter(func(p : Post) : Bool { p.author == user })
      .map(archivePost)
      .toArray();
  };

  public shared func deletePost(postId : Nat) : async () {
    switch (posts.get(postId)) {
      case (null) { Runtime.trap("Post not found") };
      case (?_) { posts.remove(postId) };
    };
  };

  public shared func updatePost(postId : Nat, title : Text, content : Text, postType : PostType) : async () {
    switch (posts.get(postId)) {
      case (null) { Runtime.trap("Post not found") };
      case (?post) {
        posts.add(postId, { post with title; content; postType; timestamp = Time.now() });
      };
    };
  };

  public shared ({ caller }) func likePost(postId : Nat) : async () {
    switch (posts.get(postId)) {
      case (null) { Runtime.trap("Post not found") };
      case (?post) {
        post.likes.add(caller);
      };
    };
  };

  public query func getPostLikes(postId : Nat) : async [Principal] {
    switch (posts.get(postId)) {
      case (null) { Runtime.trap("Post not found") };
      case (?post) { post.likes.toArray() };
    };
  };

  public query func searchPosts(keyword : Text) : async [PostView] {
    posts.values()
      .filter(func(p : Post) : Bool {
        p.title.contains(#text keyword) or p.content.contains(#text keyword);
      })
      .map(archivePost)
      .toArray();
  };

  // Comments
  public shared ({ caller }) func addComment(postId : Nat, content : Text) : async Nat {
    switch (posts.get(postId)) {
      case (null) { Runtime.trap("Post not found") };
      case (_) {};
    };
    let commentId = nextCommentId;
    nextCommentId += 1;
    comments.add(commentId, { id = commentId; postId; content; author = caller; timestamp = Time.now() });
    commentId;
  };

  public query func getComments(postId : Nat) : async [Comment] {
    comments.values()
      .filter(func(c : Comment) : Bool { c.postId == postId })
      .toArray();
  };

  public shared func deleteComment(commentId : Nat) : async () {
    switch (comments.get(commentId)) {
      case (null) { Runtime.trap("Comment not found") };
      case (?_) { comments.remove(commentId) };
    };
  };

  public shared func updateComment(commentId : Nat, content : Text) : async () {
    switch (comments.get(commentId)) {
      case (null) { Runtime.trap("Comment not found") };
      case (?comment) {
        comments.add(commentId, { comment with content; timestamp = Time.now() });
      };
    };
  };

  // Messaging
  public shared ({ caller }) func sendMessage(recipient : Principal, content : Text) : async Nat {
    let messageId = nextMessageId;
    nextMessageId += 1;
    messages.add(messageId, { id = messageId; sender = caller; recipient; content; timestamp = Time.now() });
    messageId;
  };

  public query ({ caller }) func getConversation(withUser : Principal) : async [Message] {
    messages.values()
      .filter(func(m : Message) : Bool {
        (m.sender == caller and m.recipient == withUser) or (m.sender == withUser and m.recipient == caller);
      })
      .toArray();
  };

  public shared func deleteMessage(messageId : Nat) : async () {
    switch (messages.get(messageId)) {
      case (null) { Runtime.trap("Message not found") };
      case (?_) { messages.remove(messageId) };
    };
  };

  // Profiles
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    profiles.get(caller);
  };

  public query func getUserProfile(user : Principal) : async ?UserProfile {
    profiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    profiles.add(caller, profile);
  };

  public shared ({ caller }) func updateProfile(displayName : Text, bio : Text, avatarUrl : Text) : async () {
    profiles.add(caller, { displayName; bio; avatarUrl });
  };

  public query func getProfileId(user : Principal) : async UserProfile {
    switch (profiles.get(user)) {
      case (?profile) { profile };
      case (null) { Runtime.trap("Profile not found") };
    };
  };

};
