// API Route: /api/history
// Endpoints for retrieving analysis history and statistics

import { NextRequest, NextResponse } from "next/server";
import {
  getAnalysisHistory,
  getSessionDetails,
  getHealthScoreTrend,
  getTacticStats,
  supabaseAdmin,
} from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action') || 'history';
  const userId = searchParams.get('userId') || 'anonymous';
  const sessionId = searchParams.get('sessionId');
  const mode = searchParams.get('mode') as 'relationship' | 'scam' | 'self_analysis' | undefined;
  const limit = parseInt(searchParams.get('limit') || '20', 10);
  const days = parseInt(searchParams.get('days') || '30', 10);

  try {
    switch (action) {
      case 'history': {
        const history = await getAnalysisHistory(userId, limit, mode || undefined);
        return NextResponse.json({
          success: true,
          data: history,
          count: history.length,
        });
      }

      case 'session': {
        if (!sessionId) {
          return NextResponse.json(
            { error: 'sessionId is required for session action' },
            { status: 400 }
          );
        }
        const session = await getSessionDetails(sessionId);
        if (!session) {
          return NextResponse.json(
            { error: 'Session not found' },
            { status: 404 }
          );
        }
        return NextResponse.json({
          success: true,
          data: session,
        });
      }

      case 'health-trend': {
        const trend = await getHealthScoreTrend(userId, days);
        return NextResponse.json({
          success: true,
          data: trend,
          days,
        });
      }

      case 'tactic-stats': {
        const stats = await getTacticStats(userId);
        return NextResponse.json({
          success: true,
          data: stats,
          days,
        });
      }

      case 'summary': {
        // Get comprehensive summary for a user
        const [history, healthTrend, tacticStats] = await Promise.all([
          getAnalysisHistory(userId, 5),
          getHealthScoreTrend(userId, 30),
          getTacticStats(userId),
        ]);

        // Calculate average health score
        const avgHealth = healthTrend.length > 0
          ? healthTrend.reduce((sum, h: any) => sum + h.score, 0) / healthTrend.length
          : null;

        // Get most common threat level
        const threatCounts = history.reduce((acc, h: any) => {
          acc[h.threat_level] = (acc[h.threat_level] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        const mostCommonThreat = Object.entries(threatCounts)
          .sort(([, a], [, b]) => b - a)[0]?.[0] || 'green';

        return NextResponse.json({
          success: true,
          data: {
            recentAnalyses: history,
            healthTrend,
            tacticStats,
            summary: {
              totalAnalyses: history.length,
              averageHealthScore: avgHealth ? Math.round(avgHealth) : null,
              mostCommonThreatLevel: mostCommonThreat,
              topTactics: tacticStats.slice(0, 5),
            },
          },
        });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}. Valid: history, session, health-trend, tactic-stats, summary` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('[History API Error]:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch history',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Delete a session
export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sessionId = searchParams.get('sessionId');
  const userId = searchParams.get('userId');

  if (!sessionId) {
    return NextResponse.json(
      { error: 'sessionId is required' },
      { status: 400 }
    );
  }

  try {
    // Verify ownership if userId provided
    if (userId) {
      const { data: session } = await supabaseAdmin
        .from('analysis_sessions')
        .select('user_id')
        .eq('id', sessionId)
        .single();

      if (session && session.user_id !== userId) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        );
      }
    }

    // Delete session (cascade will handle related records)
    const { error } = await supabaseAdmin
      .from('analysis_sessions')
      .delete()
      .eq('id', sessionId);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Session deleted',
    });
  } catch (error) {
    console.error('[History API Delete Error]:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete session',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
