'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function logoutAction() {
  // Clear the session cookie
  cookies().set({
    name: 'firebase-session-token',
    value: '',
    path: '/',
    maxAge: 0,
  });

  // Redirect to the login page
  redirect('/login');
}
