import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL  = "https://emtywnucswytljkqgaoh.supabase.co"
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtdHl3bnVjc3d5dGxqa3FnYW9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNjkwNDEsImV4cCI6MjA5NDk0NTA0MX0.6BCa0W7rXRcH-xonPiqebv9rgzR47dENZ3mXFStFyRg"

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)