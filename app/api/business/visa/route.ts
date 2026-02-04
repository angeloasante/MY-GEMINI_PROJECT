// ============================================
// VISA ANALYSIS API ROUTE
// ============================================
// POST /api/business/visa
// Analyzes visa documents and validates against Diaspora AI API

import { NextRequest, NextResponse } from "next/server";
import { analyzeVisaDocuments, getVisaRequirements } from "@/lib/agents/business";
import { createClient } from "@supabase/supabase-js";
import type { VisaLensInput, VisaLensOutput } from "@/types/business";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const destinationCountry = formData.get("destinationCountry") as string;
    const passportCountry = formData.get("passportCountry") as string;
    const travelDate = formData.get("travelDate") as string;
    const tripPurpose = formData.get("tripPurpose") as string;
    const tripDuration = parseInt(formData.get("tripDuration") as string) || 14;
    const userId = formData.get("userId") as string | null;
    
    // Collect all uploaded documents
    const documents: VisaLensInput["documents"] = [];
    
    // Process passport
    const passportFile = formData.get("passport") as File | null;
    if (passportFile) {
      const buffer = Buffer.from(await passportFile.arrayBuffer());
      documents.push({
        type: "passport",
        content: buffer.toString("base64"),
        mimeType: passportFile.type,
        filename: passportFile.name,
      });
    }
    
    // Process bank statements
    const bankStatements = formData.getAll("bankStatements") as File[];
    for (const file of bankStatements) {
      const buffer = Buffer.from(await file.arrayBuffer());
      documents.push({
        type: "bank_statement",
        content: buffer.toString("base64"),
        mimeType: file.type,
        filename: file.name,
      });
    }
    
    // Process employment letter
    const employmentLetter = formData.get("employmentLetter") as File | null;
    if (employmentLetter) {
      const buffer = Buffer.from(await employmentLetter.arrayBuffer());
      documents.push({
        type: "employment_letter",
        content: buffer.toString("base64"),
        mimeType: employmentLetter.type,
        filename: employmentLetter.name,
      });
    }
    
    // Process invitation letter
    const invitationLetter = formData.get("invitationLetter") as File | null;
    if (invitationLetter) {
      const buffer = Buffer.from(await invitationLetter.arrayBuffer());
      documents.push({
        type: "invitation_letter",
        content: buffer.toString("base64"),
        mimeType: invitationLetter.type,
        filename: invitationLetter.name,
      });
    }
    
    // Process itinerary
    const itinerary = formData.get("itinerary") as File | null;
    if (itinerary) {
      const buffer = Buffer.from(await itinerary.arrayBuffer());
      documents.push({
        type: "itinerary",
        content: buffer.toString("base64"),
        mimeType: itinerary.type,
        filename: itinerary.name,
      });
    }
    
    // Additional documents
    const additionalDocs = formData.getAll("additionalDocuments") as File[];
    for (const file of additionalDocs) {
      const buffer = Buffer.from(await file.arrayBuffer());
      documents.push({
        type: "other",
        content: buffer.toString("base64"),
        mimeType: file.type,
        filename: file.name,
      });
    }
    
    // Validate required fields
    if (!destinationCountry || !passportCountry) {
      return NextResponse.json(
        { error: "Destination country and passport country are required" },
        { status: 400 }
      );
    }
    
    // Build input
    const input: VisaLensInput = {
      documents,
      destinationCountry,
      passportCountry,
      travelDate,
      tripPurpose: tripPurpose as VisaLensInput["tripPurpose"],
      tripDuration,
    };
    
    // Analyze documents
    const result: VisaLensOutput = await analyzeVisaDocuments(input);
    
    // Save to database if user is logged in
    if (userId) {
      // Create visa application record
      const { data: application, error: appError } = await supabase
        .from("visa_applications")
        .insert({
          user_id: userId,
          destination_country: destinationCountry,
          passport_country: passportCountry,
          travel_date: travelDate || null,
          trip_purpose: tripPurpose || null,
          trip_duration: tripDuration,
          visa_required: result.visaRequired,
          visa_type: result.visaType,
          processing_time: result.processingTime,
          estimated_cost: result.estimatedCost,
          approval_likelihood: result.approvalLikelihood,
          checklist: result.checklist,
          issues: result.issues,
          next_steps: result.nextSteps,
          embassy_info: result.embassyInfo,
        })
        .select()
        .single();
      
      if (!appError && application) {
        // Save document analysis results
        for (const doc of result.documentAnalysis || result.documentsAnalyzed || []) {
          await supabase.from("visa_documents").insert({
            application_id: application.id,
            document_type: doc.type,
            filename: doc.fileName,
            extracted_data: doc.extracted,
            issues: doc.issues,
            valid: doc.isValid,
          });
        }
      }
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("[VISA API ERROR]", error);
    return NextResponse.json(
      { error: "Failed to analyze visa documents" },
      { status: 500 }
    );
  }
}

// GET endpoint to just check visa requirements without document analysis
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const destinationCountry = searchParams.get("destinationCountry");
    const passportCountry = searchParams.get("passportCountry");
    
    if (!destinationCountry || !passportCountry) {
      return NextResponse.json(
        { error: "destinationCountry and passportCountry are required" },
        { status: 400 }
      );
    }
    
    const requirements = await getVisaRequirements(passportCountry, destinationCountry);
    
    return NextResponse.json(requirements);
  } catch (error) {
    console.error("[VISA REQUIREMENTS API ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch visa requirements" },
      { status: 500 }
    );
  }
}
