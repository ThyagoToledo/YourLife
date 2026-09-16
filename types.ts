// ============================================
// TIPOS E INTERFACES - TYPESCRIPT
// ============================================

export interface User {
    id: number;
    name: string;
    email: string;
    avatar: string;
    profile: UserProfile;
}

export interface UserProfile {
    name: string;
    avatar: string;
    coverImage?: string;
    bio: string;
    interests: string[];
    createdAt?: Date;
    followersCount?: number;
    followingCount?: number;
}

export interface Post {
    id: string;
    author: PostAuthor;
    content: string;
    timestamp: string;
    likes: number;
    likesCount?: number;
    commentsCount?: number;
    comments: Comment[];
    isLiked?: boolean;
    images?: string[];
    advices?: Advice[];
}

export interface PostAuthor {
    id: number;
    name: string;
    avatar: string;
}

export interface Comment {
    id: string;
    postId: string;
    author: CommentAuthor;
    content: string;
    timestamp: string;
    likes?: number;
}

export interface CommentAuthor {
    id: number;
    name: string;
    avatar?: string;
}

export interface Advice {
    id: string;
    postId: string;
    author: PostAuthor;
    content: string;
    timestamp: string;
    likes: number;
    isHelpful?: boolean;
}

export interface Notification {
    id: string;
    type: 'like' | 'comment' | 'follow' | 'advice' | 'mention';
    from: PostAuthor;
    content: string;
    timestamp: string;
    read: boolean;
    link?: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    confirmPassword?: string;
}

export interface SearchResult {
    users: User[];
    posts: Post[];
}

export interface FeedFilter {
    page?: number;
    limit?: number;
    userId?: string;
}

export interface AuthToken {
    token: string;
    expiresAt: number;
}

export interface AppState {
    currentUser: User | null;
    isAuthenticated: boolean;
    currentView: ViewType;
    feed: Post[];
    notifications: Notification[];
    searchResults: SearchResult | null;
}

export type ViewType = 'feed' | 'profile' | 'friends' | 'advice' | 'search' | 'notifications' | 'messages' | 'social-chat' | 'calls' | 'communities';

export type ConversationKind = 'direct' | 'group' | 'channel';
export type MessageFormat = 'plain' | 'markdown';
export type MediaStatus = 'pending' | 'processing' | 'approved' | 'review' | 'rejected' | 'failed';
export type CallState = 'ringing' | 'accepted' | 'active' | 'ended' | 'declined' | 'missed' | 'failed';

export interface Conversation {
    id: string;
    kind: ConversationKind;
    title: string | null;
    communityId?: string | null;
    role: 'owner' | 'admin' | 'member';
    lastMessageId?: string | null;
    lastMessage?: string | null;
    lastMessageAt?: string | null;
}

export interface ChatMessage {
    id: string;
    conversationId: string;
    senderId: number;
    senderName: string;
    content: string;
    format: MessageFormat;
    replyToId?: string | null;
    createdAt: string;
    editedAt?: string | null;
    deletedAt?: string | null;
}

export interface MediaAsset {
    id: string;
    purpose: 'avatar' | 'cover' | 'post' | 'message' | 'community';
    fileName: string;
    contentType: 'image/jpeg' | 'image/png' | 'image/webp';
    byteSize?: number | null;
    status: MediaStatus;
    publicUrl?: string | null;
    createdAt: string;
}

export interface Community {
    id: string;
    name: string;
    description: string;
    visibility: 'public' | 'private';
    role: 'owner' | 'admin' | 'moderator' | 'member';
    memberCount: number;
}

export interface CallRecord {
    id: string;
    conversationId: string;
    state: CallState;
    participantState: 'invited' | 'joined' | 'declined' | 'left' | 'missed';
    createdAt: string;
    startedAt?: string | null;
    endedAt?: string | null;
}

export interface ApiConfig {
    baseUrl: string;
    timeout: number;
    headers: Record<string, string>;
}
