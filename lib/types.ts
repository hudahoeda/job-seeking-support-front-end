export interface UserData {
  id: string
  email: string
  aud: string
  role: string | null
  email_confirmed_at: string | null
}

export interface VideoUpload {
  id: string
  user_id: string
  video_url: string
  original_filename: string
  storage_filename: string
  file_size: number
  upload_status: string
  created_at: string
  updated_at: string
}

export interface UserResponse {
  user_data: UserData
  access_expiry?: string | null
  minutes_remaining?: number | null
  is_active?: boolean | null
  video_upload?: VideoUpload | null
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: UserResponse
}

