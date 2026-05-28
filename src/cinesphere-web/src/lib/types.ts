export interface TmdbMovieDto {
  id: number;
  title: string;
  posterPath: string | null;
  overview: string | null;
  voteCount: number | null;
}

export interface PostDto {
  id: string;
  userId: string;
  userDisplayName: string;
  userAvatarUrl: string | null;
  createdAt: string;
  content: string | null;
  isSpoiler: boolean;
  commentCount: number;
  reactionCount: number;
  postType: string;
  movie: TmdbMovieDto | null;
}

export interface MovieLogPostDto extends PostDto {
  tmdbMovieId: number;
  rating: number;
  watchedDate: string;
  isRewatch: boolean;
}

export interface CommentDto {
  id: string;
  userId: string;
  userDisplayName: string;
  userAvatarUrl: string | null;
  text: string;
  createdAt: string;
}

export interface ReactionResult {
  isReacted: boolean;
  totalReactions: number;
  currentUserReaction: 'Like' | 'Popcorn' | 'MindBlown' | null;
}

export interface SocialFeedResponse {
  posts: PostDto[];
  page: number;
  totalPages: number;
  totalCount: number;
}

export interface MovieSearchResponse {
  results: TmdbMovieDto[];
  totalPages: number;
  totalResults: number;
}

export interface CustomListDto {
  id: string;
  name: string;
  description: string | null;
  userId: string;
  createdAt: string;
  postCount: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
  userName: string;
}
