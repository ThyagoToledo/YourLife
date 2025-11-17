// ============================================
// TIPOS E INTERFACES - TYPESCRIPT
// ============================================

export interface User {
    id: string;
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
    id: string;
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
    id: string;
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

export type ViewType = 'feed' | 'profile' | 'friends' | 'advice' | 'search' | 'notifications';

export interface ApiConfig {
    baseUrl: string;
    timeout: number;
    headers: Record<string, string>;
}
