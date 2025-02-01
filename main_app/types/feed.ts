export interface Feed {
  id: number;
  created_at: string;
  user_id: string;
  image: string;
  status: string;
}

export interface FeedInfoUser {
  id: string;
  age: number;
  full_name: string;
  gender: string;
  location: string | null;
}

export interface FeedInfoResponse {
  feeds: Feed[];
  info: FeedInfoUser[];
}
