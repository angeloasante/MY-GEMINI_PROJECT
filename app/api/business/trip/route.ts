// ============================================
// TRIP PLANNING API ROUTE
// ============================================
// POST /api/business/trip
// Plans multi-city trips with visa requirements per stop

import { NextRequest, NextResponse } from "next/server";
import { planTrip } from "@/lib/agents/business";
import { createClient } from "@supabase/supabase-js";
import type { TripGuardInput, TripGuardOutput, TripStopResult, PerStopAnalysis } from "@/types/business";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      passportCountry,
      stops,
      startDate,
      preferences,
      userId,
    } = body;
    
    // Validate required fields
    if (!passportCountry) {
      return NextResponse.json(
        { error: "passportCountry is required" },
        { status: 400 }
      );
    }
    
    if (!stops || !Array.isArray(stops) || stops.length === 0) {
      return NextResponse.json(
        { error: "At least one stop is required" },
        { status: 400 }
      );
    }
    
    // Validate each stop
    for (let i = 0; i < stops.length; i++) {
      const stop = stops[i];
      if (!stop.country) {
        return NextResponse.json(
          { error: `Stop ${i + 1} is missing country` },
          { status: 400 }
        );
      }
      if (!stop.duration || stop.duration < 1) {
        return NextResponse.json(
          { error: `Stop ${i + 1} must have a duration of at least 1 day` },
          { status: 400 }
        );
      }
    }
    
    // Build input
    const input: TripGuardInput = {
      passportCountry,
      stops: stops.map((stop: { country: string; city?: string; duration: number; purpose?: string }) => ({
        country: stop.country,
        city: stop.city,
        duration: stop.duration,
        purpose: stop.purpose as TripGuardInput["stops"][0]["purpose"],
      })),
      startDate,
      preferences: preferences ? {
        avoidTransitVisa: preferences.avoidTransitVisa,
        preferDirectFlights: preferences.preferDirectFlights,
        budgetLevel: preferences.budgetLevel,
        prioritizeVisaFree: preferences.prioritizeVisaFree,
      } : undefined,
    };
    
    // Plan the trip
    const result: TripGuardOutput = await planTrip(input);
    
    // Save to database if user is logged in
    if (userId) {
      const { data: tripPlan, error: tripError } = await supabase
        .from("trip_plans")
        .insert({
          user_id: userId,
          passport_country: passportCountry,
          start_date: startDate || null,
          total_days: result.totalDays,
          total_cost: result.totalCost,
          warnings: result.warnings,
          timeline: result.timeline,
          consolidated_documents: result.consolidatedDocuments,
          recommendations: result.recommendations,
          alternative_routes: result.alternativeRoutes,
        })
        .select()
        .single();
      
      if (!tripError && tripPlan) {
        // Save individual stops
        const stops = result.stops || result.perStopAnalysis || [];
        for (let i = 0; i < stops.length; i++) {
          const stop = stops[i] as TripStopResult | PerStopAnalysis;
          await supabase.from("trip_stops").insert({
            trip_id: tripPlan.id,
            order_index: i,
            country: stop.country,
            city: "city" in stop ? stop.city : null,
            duration: "duration" in stop ? stop.duration : stop.processingDays || 0,
            purpose: "purpose" in stop ? stop.purpose : null,
            visa_required: stop.visaRequired,
            visa_type: stop.visaType || null,
            visa_cost: stop.visaCost || null,
            processing_time: stop.processingTime || null,
            entry_requirements: "entryRequirements" in stop ? stop.entryRequirements : stop.documents,
            transit_info: stop.transitInfo || null,
            travel_advisory: stop.travelAdvisory || null,
          });
        }
      }
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("[TRIP API ERROR]", error);
    return NextResponse.json(
      { error: "Failed to plan trip" },
      { status: 500 }
    );
  }
}

// GET endpoint to get supported countries and transit info
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  
  if (type === "countries") {
    // Return list of supported countries
    return NextResponse.json({
      countries: [
        { code: "US", name: "United States" },
        { code: "UK", name: "United Kingdom" },
        { code: "CA", name: "Canada" },
        { code: "AU", name: "Australia" },
        { code: "DE", name: "Germany" },
        { code: "FR", name: "France" },
        { code: "JP", name: "Japan" },
        { code: "CN", name: "China" },
        { code: "SG", name: "Singapore" },
        { code: "AE", name: "United Arab Emirates" },
        { code: "NG", name: "Nigeria" },
        { code: "GH", name: "Ghana" },
        { code: "KE", name: "Kenya" },
        { code: "ZA", name: "South Africa" },
        { code: "IN", name: "India" },
        { code: "BR", name: "Brazil" },
        { code: "MX", name: "Mexico" },
        { code: "TH", name: "Thailand" },
        { code: "IT", name: "Italy" },
        { code: "ES", name: "Spain" },
        { code: "NL", name: "Netherlands" },
        { code: "CH", name: "Switzerland" },
        { code: "SE", name: "Sweden" },
        { code: "NO", name: "Norway" },
        { code: "DK", name: "Denmark" },
        { code: "FI", name: "Finland" },
        { code: "PL", name: "Poland" },
        { code: "CZ", name: "Czech Republic" },
        { code: "AT", name: "Austria" },
        { code: "PT", name: "Portugal" },
        { code: "GR", name: "Greece" },
        { code: "TR", name: "Turkey" },
        { code: "EG", name: "Egypt" },
        { code: "MA", name: "Morocco" },
        { code: "RW", name: "Rwanda" },
        { code: "ET", name: "Ethiopia" },
        { code: "TZ", name: "Tanzania" },
        { code: "UG", name: "Uganda" },
        { code: "ZW", name: "Zimbabwe" },
        { code: "BW", name: "Botswana" },
        { code: "NA", name: "Namibia" },
        { code: "MU", name: "Mauritius" },
        { code: "SC", name: "Seychelles" },
        { code: "KR", name: "South Korea" },
        { code: "TW", name: "Taiwan" },
        { code: "HK", name: "Hong Kong" },
        { code: "MY", name: "Malaysia" },
        { code: "ID", name: "Indonesia" },
        { code: "PH", name: "Philippines" },
        { code: "VN", name: "Vietnam" },
        { code: "NZ", name: "New Zealand" },
        { code: "AR", name: "Argentina" },
        { code: "CL", name: "Chile" },
        { code: "CO", name: "Colombia" },
        { code: "PE", name: "Peru" },
      ],
    });
  }
  
  if (type === "transit-hubs") {
    return NextResponse.json({
      transitHubs: [
        {
          code: "AE",
          name: "Dubai (UAE)",
          airlines: ["Emirates"],
          transitVisaFree: "Most nationalities for 48-96 hours",
        },
        {
          code: "QA",
          name: "Doha (Qatar)",
          airlines: ["Qatar Airways"],
          transitVisaFree: "Most nationalities for 24-96 hours",
        },
        {
          code: "TR",
          name: "Istanbul (Turkey)",
          airlines: ["Turkish Airlines"],
          transitVisaFree: "Airside transit usually visa-free",
        },
        {
          code: "ET",
          name: "Addis Ababa (Ethiopia)",
          airlines: ["Ethiopian Airlines"],
          transitVisaFree: "24-hour transit visa on arrival",
        },
        {
          code: "SG",
          name: "Singapore",
          airlines: ["Singapore Airlines"],
          transitVisaFree: "96 hours for most nationalities",
        },
        {
          code: "NL",
          name: "Amsterdam (Netherlands)",
          airlines: ["KLM"],
          transitVisaFree: "Schengen rules apply",
        },
        {
          code: "UK",
          name: "London (UK)",
          airlines: ["British Airways"],
          transitVisaFree: "Direct Airside Transit Visa may be required",
        },
        {
          code: "DE",
          name: "Frankfurt (Germany)",
          airlines: ["Lufthansa"],
          transitVisaFree: "Schengen rules apply",
        },
      ],
    });
  }
  
  return NextResponse.json({
    endpoints: {
      "POST /api/business/trip": "Plan a multi-city trip",
      "GET /api/business/trip?type=countries": "Get supported countries",
      "GET /api/business/trip?type=transit-hubs": "Get transit hub information",
    },
  });
}
