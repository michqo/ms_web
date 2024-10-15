interface LoginResponse {
  refresh: string;
  access: string;
}

interface PostUserErrorResponse {
  username?: string[];
  password?: string[];
}

interface RefreshJWTResponse {
  access: string;
}

export type { LoginResponse, PostUserErrorResponse, RefreshJWTResponse };
