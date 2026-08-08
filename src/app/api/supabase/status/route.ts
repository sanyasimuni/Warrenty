import { NextResponse } from 'next/server';
import { supabase, getServiceSupabase, isSupabaseConfigured } from '@/lib/supabase';

export async function GET() {
  const startTime = Date.now();
  const configured = isSupabaseConfigured();

  const details = {
    connected: false,
    latencyMs: 0,
    projectId: process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID || 'ogjyhzkgvvsscyapybal',
    projectUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ogjyhzkgvvsscyapybal.supabase.co',
    region: process.env.NEXT_PUBLIC_SUPABASE_REGION || 'ap-southeast-1',
    hasAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    hasServiceKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    tablesStatus: {} as Record<string, string>,
    error: null as string | null,
  };

  try {
    const client = getServiceSupabase();
    
    // Attempt a light query (e.g. check table existence or auth health)
    const { data, error } = await client.from('assets').select('id').limit(1);

    details.latencyMs = Date.now() - startTime;

    if (error) {
      // If table doesn't exist yet, Supabase is still connected and responsive
      if (error.code === '42P01' || error.message.includes('relation') || error.message.includes('does not exist')) {
        details.connected = true;
        details.tablesStatus['assets'] = 'Table ready to be initialized via schema.sql';
      } else {
        details.error = error.message;
        details.connected = true; // Connection reached Supabase server
      }
    } else {
      details.connected = true;
      details.tablesStatus['assets'] = 'Connected & Active';
    }

    return NextResponse.json({
      success: true,
      status: 'online',
      message: 'Successfully connected to Supabase Database Project (ap-southeast-1)',
      details,
    });
  } catch (err: any) {
    details.latencyMs = Date.now() - startTime;
    details.error = err.message || 'Unknown network error';

    return NextResponse.json(
      {
        success: false,
        status: 'error',
        message: 'Could not establish connection to Supabase instance',
        details,
      },
      { status: 500 }
    );
  }
}
