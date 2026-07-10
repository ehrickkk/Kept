export interface PhotoEntry {
  id: string
  image_url: string
  caption: string
  date: string
  tag?: string
  created_at: string
}

export interface YearCover {
  year: number
  image_url: string
  updated_at: string
}
