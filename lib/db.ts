import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database schema types
export type User = {
  id: string
  email: string
  first_name?: string
  last_name?: string
  company_name?: string
  is_admin: boolean
  created_at: string
  last_active?: string
  status: 'active' | 'pending' | 'inactive'
}

export type Parameter = {
  id: string
  user_id: string
  title: string
  param_name: string
  param_value?: string
  param_type: 'parameter' | 'url'
  message?: string
  refresh_hours: number
  frequency: 'always' | 'once' | 'daily' | 'weekly'
  last_checked?: string
  email_notifications?: string
  slack_enabled: boolean
  slack_channel?: string
  color: string
  created_at: string
  updated_at: string
}

// User functions
export async function getUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching users:', error)
    return []
  }
  
  return data as User[]
}

export async function getUserById(id: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('Error fetching user:', error)
    return null
  }
  
  return data as User
}

export async function createUser(user: Omit<User, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('users')
    .insert([
      { 
        ...user,
        created_at: new Date().toISOString(),
      }
    ])
    .select()
  
  if (error) {
    console.error('Error creating user:', error)
    return null
  }
  
  return data?.[0] as User
}

export async function updateUser(id: string, updates: Partial<User>) {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', id)
    .select()
  
  if (error) {
    console.error('Error updating user:', error)
    return null
  }
  
  return data?.[0] as User
}

export async function deleteUser(id: string) {
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting user:', error)
    return false
  }
  
  return true
}

// Parameter functions
export async function getParameters(userId?: string) {
  let query = supabase
    .from('parameters')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (userId) {
    query = query.eq('user_id', userId)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching parameters:', error)
    return []
  }
  
  return data as Parameter[]
}

export async function getParameterById(id: string) {
  const { data, error } = await supabase
    .from('parameters')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('Error fetching parameter:', error)
    return null
  }
  
  return data as Parameter
}

export async function createParameter(parameter: Omit<Parameter, 'id' | 'created_at' | 'updated_at'>) {
  const now = new Date().toISOString()
  
  const { data, error } = await supabase
    .from('parameters')
    .insert([
      { 
        ...parameter,
        created_at: now,
        updated_at: now
      }
    ])
    .select()
  
  if (error) {
    console.error('Error creating parameter:', error)
    return null
  }
  
  return data?.[0] as Parameter
}

export async function updateParameter(id: string, updates: Partial<Parameter>) {
  const { data, error } = await supabase
    .from('parameters')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
  
  if (error) {
    console.error('Error updating parameter:', error)
    return null
  }
  
  return data?.[0] as Parameter
}

export async function deleteParameter(id: string) {
  const { error } = await supabase
    .from('parameters')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting parameter:', error)
    return false
  }
  
  return true
}

