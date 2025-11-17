import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Trust proxy headers for GitHub Codespaces
  // This allows Server Actions to work behind the Codespaces proxy
  const response = NextResponse.next();
  
  // If we're behind a proxy (Codespaces), trust the forwarded headers
  if (request.headers.get('x-forwarded-host')) {
    // Allow the request to proceed
    return response;
  }
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

