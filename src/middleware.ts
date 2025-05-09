import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const requestUrl = new URL(req.url);

  const sessionCookie = req.cookies.get('connect.sid');

  try {
    const response = await fetch(`${process.env.BACKEND_URL}/be/auth`, {
      credentials: 'include',
      headers: {
        Cookie: `connect.sid=${sessionCookie?.value}`,
      },
    });

    const session = await response.json();

    if (
      !session.user &&
      requestUrl.pathname !== '/' &&
      requestUrl.pathname !== '/import' &&
      requestUrl.pathname !== '/annotation-tool' &&
      requestUrl.pathname !== '/your-model' &&
      requestUrl.pathname !== '/request' &&
      requestUrl.pathname !== '/documentation' &&
      requestUrl.pathname !== '/about-us' &&
      requestUrl.pathname !== '/contact'
    ) {
      return NextResponse.redirect(`${requestUrl.origin}/auth/login`);
    }
  } catch (error) {
    console.error(error);
  }

  return NextResponse.next();
}

// Ensure the middleware is only called for relevant paths.
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|auth|_next/static|_next/image|images|icons|stylesheets|favicon.ico).*)',
  ],
};
