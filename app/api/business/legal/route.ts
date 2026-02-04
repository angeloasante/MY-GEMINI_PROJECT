// ============================================
// LEGAL ANALYSIS API ROUTE
// ============================================
// POST /api/business/legal
// Analyzes contracts for red flags and provides plain English explanations

import { NextRequest, NextResponse } from "next/server";
import { analyzeContract, RED_FLAG_DEFINITIONS } from "@/lib/agents/business";
import { createClient } from "@supabase/supabase-js";
import type { LegalLensInput, LegalLensOutput, RedFlagType } from "@/types/business";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";
    
    let input: LegalLensInput;
    let userId: string | null = null;
    
    if (contentType.includes("multipart/form-data")) {
      // Handle file upload
      const formData = await request.formData();
      const file = formData.get("document") as File | null;
      const documentText = formData.get("documentText") as string | null;
      const documentType = formData.get("documentType") as string || "contract";
      const focusAreas = formData.get("focusAreas") as string | null;
      userId = formData.get("userId") as string | null;
      
      if (!file && !documentText) {
        return NextResponse.json(
          { error: "Either a document file or document text is required" },
          { status: 400 }
        );
      }
      
      if (file) {
        const buffer = Buffer.from(await file.arrayBuffer());
        input = {
          documentContent: buffer.toString("base64"),
          documentMimeType: file.type,
          documentFilename: file.name,
          documentType: documentType as LegalLensInput["documentType"],
          focusAreas: focusAreas ? focusAreas.split(",").map(s => s.trim()) as RedFlagType[] : undefined,
        };
      } else {
        input = {
          documentText: documentText!,
          documentType: documentType as LegalLensInput["documentType"],
          focusAreas: focusAreas ? focusAreas.split(",").map(s => s.trim()) as RedFlagType[] : undefined,
        };
      }
    } else {
      // Handle JSON body
      const body = await request.json();
      input = {
        documentText: body.documentText,
        documentType: body.documentType || "contract",
        focusAreas: body.focusAreas,
      };
      userId = body.userId;
      
      if (!body.documentText) {
        return NextResponse.json(
          { error: "documentText is required" },
          { status: 400 }
        );
      }
    }
    
    // Analyze the contract
    const result: LegalLensOutput = await analyzeContract(input);
    
    // Save to database if user is logged in
    if (userId) {
      // Create contract review record
      const { data: review, error: reviewError } = await supabase
        .from("contract_reviews")
        .insert({
          user_id: userId,
          document_type: input.documentType || "contract",
          document_filename: input.documentFilename || null,
          risk_level: result.overallRisk,
          summary: result.summary,
          key_terms: result.keyTerms,
          plain_english: result.plainEnglish,
          recommendations: result.recommendations,
          analyzed_clauses: result.analyzedClauses,
          negotiation_points: result.negotiationPoints,
        })
        .select()
        .single();
      
      if (!reviewError && review) {
        // Save red flags
        for (const flag of result.redFlags || []) {
          // Get flag type ID
          const { data: flagType } = await supabase
            .from("contract_red_flags")
            .select("id")
            .eq("flag_type", flag.type)
            .single();
          
          if (flagType) {
            await supabase.from("contract_review_flags").insert({
              review_id: review.id,
              flag_id: flagType.id,
              severity: flag.severity,
              location: flag.location,
              clause_text: flag.clauseText,
              explanation: flag.explanation,
              negotiation_tip: flag.negotiationTip,
            });
          }
        }
      }
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("[LEGAL API ERROR]", error);
    return NextResponse.json(
      { error: "Failed to analyze contract" },
      { status: 500 }
    );
  }
}

// GET endpoint to get red flag definitions
export async function GET() {
  return NextResponse.json({
    redFlagTypes: RED_FLAG_DEFINITIONS,
    documentTypes: [
      "contract",
      "nda",
      "terms_of_service",
      "employment_agreement",
      "lease",
      "loan_agreement",
      "partnership_agreement",
      "other",
    ],
  });
}
