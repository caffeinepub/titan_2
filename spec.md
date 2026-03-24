# Titan

## Current State
New project with empty backend and no frontend.

## Requested Changes (Diff)

### Add
- Role-based access system with three roles: Owner, Admin, User
- Owner passcode: owner342754; Admin passcode: admin24638
- Posts system: Owner and Admin can create posts; all users can view
- Post types: Important Update (highlighted/prioritized) and Daily Update
- Comments on posts (all users can comment)
- Chat/messaging between users
- Home feed showing all posts, Important Updates prioritized
- Role-based access panels (Owner/Admin controls)
- User profiles
- Search functionality for posts

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan
1. Backend: user management with roles, posts (type: important/daily), comments, direct messages
2. Frontend: dark-themed social media UI with feed, chat, profile, and role-based panels
3. Role validation via passcode entry (stored/checked in backend)
4. Feed prioritizes Important Updates at top with visual highlight
5. Chat section for user-to-user messaging
6. Post creation flow only accessible to Owner/Admin roles
