import { cookies } from "next/headers";

// Server-side: use Docker service name, client-side: use localhost
const AUTH_URL = process.env.AUTH_SERVICE_URL || process.env.NEXT_PUBLIC_AUTH_URL || 'http://auth:4000';

export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token');
  return token?.value || null;
}

export async function getCurrentUser() {
  const token = await getAuthToken();
  
  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${AUTH_URL}/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error('Failed to fetch current user:', error);
    return null;
  }
}

export async function getSubscription() {
  const token = await getAuthToken();
  
  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${AUTH_URL}/subscription`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error('Failed to fetch subscription:', error);
    return null;
  }
}

