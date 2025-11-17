import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Trust proxy headers for GitHub Codespaces
  // This allows Server Actions to work behind the Codespaces proxy
  
  const forwardedHost = request.headers.get('x-forwarded-host');
  const origin = request.headers.get('origin');
  
  // Check if this is a Server Actions request (POST with Next-Action header)
  const isServerAction = request.method === 'POST' && 
    (request.headers.get('content-type')?.includes('text/plain') || 
     request.nextUrl.searchParams.has('_rsc'));
  
  // If behind Codespaces proxy and it's a Server Action, rewrite headers
  if (isServerAction && forwardedHost && origin) {
    const protocol = request.headers.get('x-forwarded-proto') || 'https';
    const newOrigin = `${protocol}://${forwardedHost}`;
    
    // Create response with modified headers
    const response = NextResponse.next();
    response.headers.set('x-middleware-rewrite-origin', newOrigin);
    
    return response;
  }
  
  return NextResponse.next();
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

