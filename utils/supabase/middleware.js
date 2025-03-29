import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function updateSession(request) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Define public paths that don't require authentication
  const publicPaths = ['/', '/join-community', '/about','/learn', '/auth/sign-in']
  const isPublicPath = publicPaths.includes(request.nextUrl.pathname)

  // If user is logged in and trying to access a public path or auth page, redirect to dashboard
  if (
    user &&
    (isPublicPath || request.nextUrl.pathname.startsWith('/auth'))
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // If user is not logged in and trying to access a non-public, non-auth path, redirect to sign-in
  if (
    !user &&
    !isPublicPath &&
    !request.nextUrl.pathname.startsWith('/auth/sign-in') &&
    !request.nextUrl.pathname.startsWith('/auth')
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/sign-in'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}