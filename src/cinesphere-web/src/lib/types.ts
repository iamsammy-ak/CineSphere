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
  currentUserReaction: string | null;
}

export interface SocialFeedResponse {
  posts: PostDto[];  page: number;
  totalPages: number;
  totalCount: number;
}

export interface MovieSearchResponse {
  results: TmdbMovieDto[];
  totalPages: number;
  totalResults: number;
}

export interface UserProfileDto {
  userId: string;
  userName: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: string;
  filmCount: number;
;  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
}
