import { createClient } from "@supabase/supabase-js" // official react setup uses createClient with project URL and key to create object that communicates with the database

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

console.log("Supabase URL found:", Boolean(supabaseUrl))
console.log("Supabase key found:", Boolean(supabaseKey))

export const supabase = createClient(supabaseUrl, supabaseKey) // database connection object