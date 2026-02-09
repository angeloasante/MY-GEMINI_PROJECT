// API Route: /api/export
// Generate PDF exports of analysis results

import { NextRequest, NextResponse } from "next/server";
import { getSessionDetails, supabaseAdmin } from "@/lib/supabase";
import { AnalysisResult } from "@/types/agents";

// Helper to reconstruct full_response from separate columns
function reconstructFullResponse(session: any): AnalysisResult {
  return {
    extraction: session.extracted_data || {},
    classification: session.classification_data || {},
    psychology: session.psychology_data || {},
    defenses: session.defense_data || {},
    guardian: session.guardian_response || {},
  } as AnalysisResult;
}

// Generate HTML content for PDF
function generateExportHTML(session: {
  id: string;
  mode: string;
  platform: string;
  relationship_type: string;
  threat_level: string;
  health_score: number;
  tactics_count: number;
  created_at: string;
  extracted_data?: any;
  classification_data?: any;
  psychology_data?: any;
  defense_data?: any;
  guardian_response?: any;
  Detected_tactics: Array<{
    tactic_name: string;
    severity: string;
    confidence: number;
    evidence_quotes: string[];
  }>;
}): string {
  const result = reconstructFullResponse(session);
  const date = new Date(session.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const threatColors: Record<string, string> = {
    green: '#22c55e',
    yellow: '#eab308',
  Detectorange: '#f97316',
    red: '#ef4444',
  };

  const modeLabels: Record<string, string> = {
    relationship: '💔 Relationship Analysis',
    scam: '🛡️ Scam Shield',
    self_analysis: '🪞 Self-Analysis',
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Cleir    - Analysis Report</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
      color: #1f2937;
      line-height: 1.6;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 2px solid #e5e7eb;
    }
    .logo {
      font-size: 32px;
      font-weight: bold;
      color: #6366f1;
    }
    .subtitle {
      color: #6b7280;
      font-size: 14px;
    }
    .summary-box {
      background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
      padding: 24px;
      border-radius: 12px;
      margin-bottom: 32px;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }
    .stat {
      background: white;
      padding: 16px;
      border-radius: 8px;
      text-align: center;
    }
    .stat-value {
      font-size: 28px;
      font-weight: bold;
    }
    .stat-label {
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
    }
    .threat-badge {
      display: inline-block;
      padding: 8px 24px;
      border-radius: 20px;
      font-weight: bold;
      color: white;
      background-color: ${threatColors[session.threat_level] || '#6b7280'};
    }
    h2 {
      color: #374151;
      margin-top: 40px;
      padding-bottom: 8px;
      border-bottom: 1px solid #e5e7eb;
    }
    .tactic {
      background: #fef3f2;
      border-left: 4px solid #ef4444;
      padding: 16px;
      margin: 16px 0;
      border-radius: 0 8px 8px 0;
    }
    .tactic-header {
      font-weight: bold;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .severity {
      font-size: 12px;
      padding: 4px 12px;
      border-radius: 12px;
      background: #ef4444;
      color: white;
    }
    .severity.low { background: #eab308; }
    .severity.medium { background: #f97316; }
    .severity.high { background: #ef4444; }
    .severity.critical { background: #991b1b; }
    .quote {
      font-style: italic;
      color: #4b5563;
      margin-top: 8px;
      padding: 8px;
      background: white;
      border-radius: 4px;
    }
    .translation-table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
    }
    .translation-table th {
      background: #6366f1;
      color: white;
      padding: 12px;
      text-align: left;
    }
    .translation-table td {
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
    }
    .translation-table tr:nth-child(even) {
      background: #f9fafb;
    }
    .response-box {
      background: #ecfdf5;
      border: 1px solid #10b981;
      padding: 16px;
      border-radius: 8px;
      margin: 12px 0;
    }
    .response-type {
      font-weight: bold;
      color: #059669;
      text-transform: uppercase;
      font-size: 12px;
    }
    .validation {
      background: linear-gradient(135deg, #fdf4ff, #fae8ff);
      padding: 24px;
      border-radius: 12px;
      text-align: center;
      margin: 32px 0;
      border: 1px solid #e879f9;
    }
    .validation h3 {
      color: #a21caf;
      margin-bottom: 8px;
    }
    .resources {
      background: #f0f9ff;
      padding: 16px;
      border-radius: 8px;
      margin: 16px 0;
    }
    .resource {
      margin: 8px 0;
    }
    .resource-name {
      font-weight: bold;
    }
    .resource-contact {
      color: #6366f1;
    }
    .footer {
      margin-top: 48px;
      padding-top: 24px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #9ca3af;
      font-size: 12px;
    }
    .disclaimer {
      background: #fff7ed;
      border: 1px solid #fed7aa;
      padding: 16px;
      border-radius: 8px;
      font-size: 12px;
      color: #9a3412;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">🛡️ Cleir   </div>
    <div class="subtitle">AI-Powered Manipulation Detection Report</div>
    <p style="margin-top: 8px; color: #9ca3af; font-size: 12px;">${date}</p>
  </div>

  <div class="summary-box">
    <h3 style="margin-top: 0; text-align: center;">${modeLabels[session.mode] || session.mode}</h3>
    <div style="text-align: center; margin: 16px 0;">
      <span class="threat-badge">${(session.threat_level || 'green').toUpperCase()} ALERT</span>
    </div>
    <div class="summary-grid">
      <div class="stat">
        <div class="stat-value">${session.health_score}</div>
        <div class="stat-label">Health Score</div>
      </div>
      <div class="stat">
        <div class="stat-value">${session.tactics_count}</div>
        <div class="stat-label">Tactics Detected</div>
      </div>
      <div class="stat">
        <div class="stat-value">${session.platform || 'N/A'}</div>
        <div class="stat-label">Platform</div>
      </div>
      <div class="stat">
        <div class="stat-value">${session.relationship_type || 'N/A'}</div>
        <div class="stat-label">Relationship</div>
      </div>
    </div>
  </div>

  ${result.guardian?.summaryHeadline ? `
  <h2>📋 Summary</h2>
  <p style="font-size: 18px; font-weight: 500;">${result.guardian.summaryHeadline}</p>
  ` : ''}

  ${session.Detected_tactics && session.Detected_tactics.length > 0 ? `
  <h2>🚩 Detected Manipulation Tactics</h2>
  ${session.Detected_tactics.map(t => `
    <div class="tactic">
      <div class="tactic-header">
        <span>${t.tactic_name}</span>
        <span class="severity ${t.severity}">${t.severity.toUpperCase()}</span>
      </div>
      ${t.evidence_quotes && t.evidence_quotes.length > 0 ? 
        t.evidence_quotes.map(q => `<div class="quote">"${q}"</div>`).join('') 
        : ''}
      <div style="margin-top: 8px; font-size: 12px; color: #6b7280;">
        Confidence: ${Math.round(t.confidence * 100)}%
      </div>
    </div>
  `).join('')}
  ` : ''}

  ${result.psychology?.translations && result.psychology.translations.length > 0 ? `
  <h2>🗣️ Translation Table</h2>
  <table class="translation-table">
    <tr>
      <th>What They Said</th>
      <th>What They Meant</th>
    </tr>
    ${result.psychology.translations.map(t => `
      <tr>
        <td>"${t.original}"</td>
        <td>${t.meaning}</td>
      </tr>
    `).join('')}
  </table>
  ` : ''}

  ${result.psychology?.psychologicalExplanation ? `
  <h2>🧠 Psychological Analysis</h2>
  <p>${result.psychology.psychologicalExplanation}</p>
  ` : ''}

  ${result.psychology?.victimValidation ? `
  <div class="validation">
    <h3>💜 Remember This</h3>
    <p>${result.psychology.victimValidation}</p>
  </div>
  ` : ''}

  ${result.defenses?.recommendedResponses && result.defenses.recommendedResponses.length > 0 ? `
  <h2>💪 Recommended Responses</h2>
  ${result.defenses.recommendedResponses.slice(0, 3).map(r => `
    <div class="response-box">
      <div class="response-type">${r.type}</div>
      <p style="margin: 8px 0 0 0;">"${r.response}"</p>
    </div>
  `).join('')}
  ` : ''}

  ${result.defenses?.safetyResources && result.defenses.safetyResources.length > 0 ? `
  <h2>🆘 Safety Resources</h2>
  <div class="resources">
    ${result.defenses.safetyResources.map(r => `
      <div class="resource">
        <span class="resource-name">${r.name}</span><br>
        <span class="resource-contact">${r.contact}</span><br>
        <span style="font-size: 12px; color: #6b7280;">${r.description}</span>
      </div>
    `).join('<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 12px 0;">')}
  </div>
  ` : ''}

  <div class="disclaimer">
    <strong>⚠️ Important Disclaimer:</strong> This analysis is generated by AI and is intended for informational purposes only. 
    It is not a substitute for professional mental health advice, therapy, or counseling. 
    If you are in immediate danger, please contact emergency services or a crisis hotline immediately.
  </div>

  <div class="footer">
    <p>Generated by Cleir    | Session ID: ${session.id}</p>
    <p>This report is confidential. Please store securely.</p>
    <p style="margin-top: 16px;">🛡️ Your digital guardian against manipulation</p>
  </div>
</body>
</html>
  `;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sessionId = searchParams.get('sessionId');
  const format = searchParams.get('format') || 'html';

  if (!sessionId) {
    return NextResponse.json(
      { error: 'sessionId is required' },
      { status: 400 }
    );
  }

  try {
    const session = await getSessionDetails(sessionId);

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    if (format === 'json') {
      return NextResponse.json({
        success: true,
        data: session,
      });
    }

    // Generate HTML
    const html = generateExportHTML(session);

    // Log export
    await supabaseAdmin.from('pdf_exports').insert({
      session_id: sessionId,
      user_id: session.user_id,
      export_format: format,
    });

    if (format === 'html') {
      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html',
          'Content-Disposition': `attachment; filename="Cleir-  -report-${sessionId.slice(0, 8)}.html"`,
        },
      });
    }

    // Return HTML content for client-side PDF generation
    return NextResponse.json({
      success: true,
      html,
      sessionId,
    });
  } catch (error) {
    console.error('[Export API Error]:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate export',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
