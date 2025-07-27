export interface Job {
  id: number
  title: string
  company: string
  location: string
  province: string
  sector: string
  employment_type: string
  salary_range?: string
  description: string
  requirements?: string
  posted_date: string
  application_url?: string
  contact_email?: string
  is_active: boolean
  created_at: string
}