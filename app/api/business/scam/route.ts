// ============================================
// SCAM   ION API ROUTE
// ============================================
// POST /api/business/scam
// Analyzes business communications for fraud indicators

import { NextRequest, NextResponse } from "next/server";
import {   Scam, SCAM_PATTERNS } from "@/lib/agents/business";
import { createClient } from "@supabase/supabase-js";
import type { ScamShieldInput, ScamShieldOutput } from "@/types/business";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";
    
    let input: ScamShieldInput;
    let userId: string | null = null;
    
    if (contentType.includes("multipart/form-data")) {
      // Handle file upload (invoice image, email screenshot)
      const formData = await request.formData();
      const file = formData.get("document") as File | null;
      const contentType_input = formData.get("contentType") as string || "email";
      const claimedSender = formData.get("claimedSender") as string | null;
      const claimedAmount = formData.get("claimedAmount") as string | null;
      const emailText = formData.get("emailText") as string | null;
      const invoiceText = formData.get("invoiceText") as string | null;
      userId = formData.get("userId") as string | null;
      
      input = {
        content: emailText || invoiceText || "",
        contentType: contentType_input as ScamShieldInput["contentType"],
        claimedSender: claimedSender || undefined,
        claimedAmount: claimedAmount ? parseFloat(claimedAmount) : undefined,
      };
      
      if (file) {
        const buffer = Buffer.from(await file.arrayBuffer());
        if (contentType_input === "email") {
          input.emailContent = buffer.toString("base64");
          input.emailMimeType = file.type;
        } else {
          input.invoiceContent = buffer.toString("base64");
          input.invoiceMimeType = file.type;
        }
      }
      
      if (emailText) input.emailText = emailText;
      if (invoiceText) input.invoiceText = invoiceText;
      
    } else {
      // Handle JSON body
      const body = await request.json();
      input = {
        content: body.emailText || body.invoiceText || body.content || "",
        contentType: body.contentType || "email",
        emailText: body.emailText,
        invoiceText: body.invoiceText,
        claimedSender: body.claimedSender,
        claimedAmount: body.claimedAmount,
      };
      userId = body.userId;
    }
    
    // Validate input
    if (!input.emailText && !input.invoiceText && !input.emailContent && !input.invoiceContent) {
      return NextResponse.json(
        { error: "Either email content or invoice content is required" },
        { status: 400 }
      );
    }
    
    //    scam
    const result: ScamShieldOutput = await   Scam(input);
    
    // Save to database if user is logged in
    if (userId) {
      const { data: report, error: reportError } = await supabase
        .from("scam_reports")
        .insert({
          user_id: userId,
          content_type: input.contentType,
          claimed_sender: input.claimedSender || null,
          claimed_amount: input.claimedAmount || null,
          is_scam: result.isScam,
          risk_score: result.riskScore,
          risk_level: result.riskLevel,
          analysis: result.analysis,
            ed_patterns: result.  edPatterns,
          domain_verification: result.domainVerification,
          recommended_actions: result.recommendedActions,
          safe_alternatives: result.safeAlternatives,
        })
        .select()
        .single();
      
      if (!reportError && report) {
        // Link   ed patterns to scam_patterns table
        for (const pattern of result.  edPatterns || []) {
          const { data: patternRecord } = await supabase
            .from("scam_patterns")
            .select("id")
            .eq("pattern_type", pattern.type)
            .single();
          
          if (patternRecord) {
            await supabase.from("scam_report_patterns").insert({
              report_id: report.id,
              pattern_id: patternRecord.id,
              evidence: pattern.evidence,
              confidence: pattern.confidence,
            });
          }
        }
      }
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("[SCAM API ERROR]", error);
    return NextResponse.json(
      { error: "Failed to analyze for scam" },
      { status: 500 }
    );
  }
}

// GET endpoint to get scam pattern definitions
export async function GET() {
  return NextResponse.json({
    scamPatterns: SCAM_PATTERNS,
    contentTypes: ["email", "invoice", "message", "website"],
    riskLevels: [
      { level: "critical", description: "Almost certainly a scam - do not engage" },
      { level: "high", description: "Very likely a scam - proceed with extreme caution" },
      { level: "medium", description: "Suspicious - verify through official channels" },
      { level: "low", description: "Minor concerns - standard verification recommended" },
    ],
  });
}
