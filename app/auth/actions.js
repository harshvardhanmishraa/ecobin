'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

// Helper function to validate email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Login function
export async function login(formData) {
  const supabase = await createClient()

  const email = formData.get('email')?.toString().trim()
  const password = formData.get('password')?.toString()

  // Basic input validation
  if (!email || !password) {
    return { error: 'Missing email or password' }
  }
  if (!isValidEmail(email)) {
    return { error: 'Invalid email format' }
  }
  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters' }
  }

  const data = { email, password }
  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard') // Success case still redirects
}

// Signup function

export async function signup(formData) {
  const supabase = await createClient();

  const firstName = formData.get('firstName')?.toString().trim();
  const lastName = formData.get('lastName')?.toString().trim();
  const email = formData.get('email')?.toString().trim();
  const phone = formData.get('phone')?.toString().trim();
  const password = formData.get('password')?.toString();
  const confirmPassword = formData.get('confirmPassword')?.toString();

  // Input validation
  if (!firstName || !lastName || !email || !phone || !password || !confirmPassword) {
    return { error: 'All fields are required' };
  }
  if (!isValidEmail(email)) {
    return { error: 'Invalid email format' };
  }
  if (!/^\+?\d{10,15}$/.test(phone)) {
    return { error: 'Invalid phone number format' };
  }
  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters' };
  }
  if (password !== confirmPassword) {
    return { error: 'Passwords do not match' };
  }

  const authData = {
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        phone: phone,
        designation: 'community',
      },
    },
  };

  // Create user in auth.users
  const { data: userData, error: authError } = await supabase.auth.signUp(authData);

  if (authError) {
    console.error('Supabase auth error:', authError.message, authError.status, authError.code);
    return { error: authError.message || 'Failed to create user' };
  }

  const userId = userData.user?.id;
  if (!userId) {
    console.error('No user ID returned from signup');
    return { error: 'Failed to retrieve user ID' };
  }

  // Insert into profiles
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      first_name: firstName,
      last_name: lastName,
      total_points: 0,
    });

  if (profileError) {
    console.error('Profile insert error:', profileError.message, profileError.code);
    // Optionally delete the auth user if profile creation fails
    await supabase.auth.admin.deleteUser(userId);
    return { error: profileError.message || 'Error saving user profile' };
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard')
  return { success: 'Registration successful! You will be redirected shortly.' };
}