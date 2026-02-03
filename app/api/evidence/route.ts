// API Route: /api/evidence
// Manage evidence vault entries

import { NextRequest, NextResponse } from "next/server";
import {
  saveToEvidenceVault,
  supabaseAdmin,
} from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId') || 'anonymous';
  const category = searchParams.get('category');
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  try {
    let query = supabaseAdmin
      .from('evidence_vault')
      .select(`
        *,
        analysis_sessions (
          id,
          mode,
          platform,
          threat_level,
          created_at
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0,
    });
  } catch (error) {
    console.error('[Evidence API Error]:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch evidence',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId = 'anonymous',
      sessionId,
      category = 'conversation',
      title,
      content,
      metadata,
    } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'title and content are required' },
        { status: 400 }
      );
    }

    const evidence = await saveToEvidenceVault({
      user_id: userId,
      session_id: sessionId || null,
      category,
      title,
      content,
      metadata: metadata || {},
    });

    return NextResponse.json({
      success: true,
      data: evidence,
    });
  } catch (error) {
    console.error('[Evidence API Error]:', error);
    return NextResponse.json(
      { 
        error: 'Failed to save evidence',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const evidenceId = searchParams.get('id');
  const userId = searchParams.get('userId');

  if (!evidenceId) {
    return NextResponse.json(
      { error: 'id is required' },
      { status: 400 }
    );
  }

  try {
    // Verify ownership if userId provided
    if (userId) {
      const { data: evidence } = await supabaseAdmin
        .from('evidence_vault')
        .select('user_id')
        .eq('id', evidenceId)
        .single();

      if (evidence && evidence.user_id !== userId) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        );
      }
    }

    const { error } = await supabaseAdmin
      .from('evidence_vault')
      .delete()
      .eq('id', evidenceId);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Evidence deleted',
    });
  } catch (error) {
    console.error('[Evidence API Delete Error]:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete evidence',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
