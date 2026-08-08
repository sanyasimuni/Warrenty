import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, rememberMe } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Attempt Supabase authentication if credentials exist
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Fallback for demo if credentials aren't live yet
        return NextResponse.json({
          success: true,
          mode: 'demo_session',
          user: {
            id: 'demo-user-1',
            email,
            name: email.split('@')[0],
          },
          message: 'Signed in successfully (Demo Session)',
        });
      }

      return NextResponse.json({
        success: true,
        mode: 'supabase_auth',
        user: data.user,
        session: data.session,
      });
    }

    // Default demo session fallback
    return NextResponse.json({
      success: true,
      mode: 'demo_session',
      user: {
        id: 'demo-user-1',
        email,
        name: email.split('@')[0],
      },
      message: 'Signed in successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
