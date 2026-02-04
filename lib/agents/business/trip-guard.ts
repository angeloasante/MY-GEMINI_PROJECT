// ============================================
// TRIPGUARD AGENT - Multi-City Travel Planner
// Plans trips with per-stop visa analysis
// ============================================

import { GoogleGenAI } from "@google/genai";
import {
  TripGuardInput,
  TripGuardOutput,
  PerStopAnalysis,
  LayoverAlert,
  CombinedDocument,
  TravelAdvisory,
  TripStop,
} from "@/types/business";
import { getVisaRequirements } from "./visa-lens";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

// ============================================
// COUNTRY DATA
// ============================================

const COUNTRY_NAMES: Record<string, string> = {
  US: "United States",
  GB: "United Kingdom",
  CA: "Canada",
  AU: "Australia",
  NZ: "New Zealand",
  DE: "Germany",
  FR: "France",
  IT: "Italy",
  ES: "Spain",
  NL: "Netherlands",
  BE: "Belgium",
  CH: "Switzerland",
  AT: "Austria",
  PT: "Portugal",
  GR: "Greece",
  JP: "Japan",
  KR: "South Korea",
  CN: "China",
  SG: "Singapore",
  AE: "United Arab Emirates",
  QA: "Qatar",
  SA: "Saudi Arabia",
  ZA: "South Africa",
  KE: "Kenya",
  NG: "Nigeria",
  GH: "Ghana",
  EG: "Egypt",
  MA: "Morocco",
  BR: "Brazil",
  MX: "Mexico",
  AR: "Argentina",
  CO: "Colombia",
  PE: "Peru",
  IN: "India",
  TH: "Thailand",
  MY: "Malaysia",
  ID: "Indonesia",
  PH: "Philippines",
  VN: "Vietnam",
  TR: "Turkey",
  RU: "Russia",
  PL: "Poland",
  CZ: "Czech Republic",
  HU: "Hungary",
  SE: "Sweden",
  NO: "Norway",
  DK: "Denmark",
  FI: "Finland",
  IE: "Ireland",
};

// Common transit hubs and their visa policies
const TRANSIT_VISA_INFO: Record<string, {
  airport: string;
  visaFreeTransit: boolean;
  maxHoursVisaFree?: number;
  nationalityExceptions?: string[];
  notes: string;
}> = {
  AE: {
    airport: "Dubai (DXB)",
    visaFreeTransit: true,
    maxHoursVisaFree: 24,
    notes: "Most nationalities can transit without visa for up to 24 hours. 96-hour transit visa available.",
  },
  QA: {
    airport: "Doha (DOH)",
    visaFreeTransit: true,
    maxHoursVisaFree: 24,
    notes: "Transit without visa permitted if staying in airport for less than 24 hours.",
  },
  TR: {
    airport: "Istanbul (IST)",
    visaFreeTransit: true,
    maxHoursVisaFree: 24,
    notes: "Airside transit usually permitted. Check specific nationality requirements.",
  },
  GB: {
    airport: "London (LHR/LGW)",
    visaFreeTransit: false,
    notes: "Transit visa often required. Check UK transit visa requirements for your nationality.",
  },
  US: {
    airport: "Various US airports",
    visaFreeTransit: false,
    notes: "Transit visa (C visa) or ESTA required. No airside transit available - must clear immigration.",
  },
  SG: {
    airport: "Singapore (SIN)",
    visaFreeTransit: true,
    maxHoursVisaFree: 96,
    notes: "Most nationalities can get VFTI (Visa Free Transit Facility) for up to 96 hours.",
  },
};

// Travel advisory data (simplified)
const TRAVEL_ADVISORIES: Record<string, { level: TravelAdvisory; notes: string }> = {
  // Most Western countries are safe
  US: { level: "none", notes: "" },
  GB: { level: "none", notes: "" },
  CA: { level: "none", notes: "" },
  AU: { level: "none", notes: "" },
  DE: { level: "none", notes: "" },
  FR: { level: "low", notes: "Exercise normal precautions. Be aware of pickpockets in tourist areas." },
  IT: { level: "low", notes: "Exercise normal precautions. Watch for petty theft in major cities." },
  AE: { level: "none", notes: "" },
  SG: { level: "none", notes: "" },
  JP: { level: "none", notes: "" },
};

// ============================================
// VISA PROCESSING OPTIMIZER
// ============================================

function optimizeVisaOrder(
  stops: TripStop[],
  perStopAnalysis: PerStopAnalysis[]
): { suggestedOrder: string[]; reason: string } {
  // Sort by processing time (longest first)
  const stopsWithProcessing = perStopAnalysis
    .filter(s => s.visaRequired)
    .map(s => ({
      country: s.country,
      processingDays: s.processingDays || 0,
    }))
    .sort((a, b) => (b.processingDays || 0) - (a.processingDays || 0));

  // Build suggested order
  const suggestedOrder: string[] = [];
  const reasons: string[] = [];

  // Add countries needing visas in order of processing time
  for (const stop of stopsWithProcessing) {
    suggestedOrder.push(stop.country);
    if (stop.processingDays && stop.processingDays > 20) {
      reasons.push(`${COUNTRY_NAMES[stop.country]} visa takes ${stop.processingDays}+ days`);
    }
  }

  // Add visa-free countries at the end
  for (const analysis of perStopAnalysis) {
    if (!analysis.visaRequired && !suggestedOrder.includes(analysis.country)) {
      suggestedOrder.push(analysis.country);
    }
  }

  const reason = reasons.length > 0
    ? `Apply for visas in this order: ${reasons.join(". ")}. This ensures adequate processing time.`
    : "No specific order required - visas have similar processing times.";

  return { suggestedOrder, reason };
}

// ============================================
// DOCUMENT CONSOLIDATION
// ============================================

function consolidateDocuments(
  perStopAnalysis: PerStopAnalysis[]
): CombinedDocument[] {
  const docMap: Record<string, { countries: string[]; priority: "required" | "recommended" }> = {};

  for (const stop of perStopAnalysis) {
    for (const doc of stop.documents) {
      const normalizedDoc = doc.toLowerCase();
      
      if (!docMap[doc]) {
        docMap[doc] = { countries: [], priority: "required" };
      }
      
      if (!docMap[doc].countries.includes(stop.countryName)) {
        docMap[doc].countries.push(stop.countryName);
      }
    }
  }

  // Convert to array and sort by number of countries
  return Object.entries(docMap)
    .map(([document, data]) => ({
      document,
      forCountries: data.countries,
      priority: data.priority,
    }))
    .sort((a, b) => b.forCountries.length - a.forCountries.length);
}

// ============================================
// COST ESTIMATION
// ============================================

function estimateCosts(perStopAnalysis: PerStopAnalysis[]): {
  visaFees: string;
  insurance: string;
  total: string;
} {
  let totalVisaCost = 0;
  const costsCurrency = "USD";

  for (const stop of perStopAnalysis) {
    if (stop.estimatedCost) {
      // Extract numeric value from cost string
      const match = stop.estimatedCost.match(/[\d,]+/);
      if (match) {
        totalVisaCost += parseInt(match[0].replace(",", ""), 10);
      }
    }
  }

  // Estimate insurance (rough estimate)
  const totalDays = perStopAnalysis.reduce((sum, s) => sum + (s.processingDays || 0), 0);
  const insuranceCost = Math.max(50, totalDays * 2); // ~$2/day minimum $50

  return {
    visaFees: `$${totalVisaCost}`,
    insurance: `~$${insuranceCost}`,
    total: `~$${totalVisaCost + insuranceCost}`,
  };
}

// ============================================
// MAIN TRIPGUARD FUNCTION
// ============================================

export async function planTrip(input: TripGuardInput): Promise<TripGuardOutput> {
  console.log("[TripGuard] Starting trip planning...");
  console.log(`[TripGuard] Nationality: ${input.nationality}`);
  console.log(`[TripGuard] Stops: ${input.stops.length}`);

  const perStopAnalysis: PerStopAnalysis[] = [];
  const layoverAlerts: LayoverAlert[] = [];
  let visasRequired = 0;
  let totalDays = 0;
  
  // Use passportCountry as fallback for nationality
  const nationality = input.nationality || input.passportCountry || "";

  // Analyze each stop
  for (const stop of input.stops) {
    console.log(`[TripGuard] Analyzing stop: ${stop.country}`);
    
    const countryName = COUNTRY_NAMES[stop.country] || stop.country;
    const stopDays = stop.days || stop.duration || 1;
    totalDays += stopDays;

    // Get visa requirements
    const visaReq = await getVisaRequirements(
      nationality,
      stop.country,
      stop.purpose
    );

    if (visaReq.visaRequired) {
      visasRequired++;
    }

    // Get travel advisory
    const advisory = TRAVEL_ADVISORIES[stop.country] || { level: "none" as TravelAdvisory, notes: "" };

    const analysis: PerStopAnalysis = {
      country: stop.country,
      countryName,
      visaRequired: visaReq.visaRequired,
      visaType: visaReq.visaType,
      processingDays: visaReq.processingDays,
      documents: visaReq.documentsRequired,
      estimatedCost: visaReq.fees ? `${visaReq.fees.currency} ${visaReq.fees.amount}` : undefined,
      travelAdvisory: advisory.level,
      advisoryNotes: advisory.notes || undefined,
      notes: visaReq.additionalRequirements?.join(". "),
    };

    perStopAnalysis.push(analysis);

    // Check for layover alerts
    if (stop.purpose === "layover") {
      const transitInfo = TRANSIT_VISA_INFO[stop.country];
      if (transitInfo) {
        layoverAlerts.push({
          airport: transitInfo.airport,
          country: countryName,
          transitVisaRequired: !transitInfo.visaFreeTransit,
          maxHours: transitInfo.maxHoursVisaFree,
          notes: transitInfo.notes,
        });
      }
    }
  }

  // Optimize visa application order
  const { suggestedOrder, reason: orderingReason } = optimizeVisaOrder(
    input.stops,
    perStopAnalysis
  );

  // Consolidate documents
  const combinedDocumentChecklist = consolidateDocuments(perStopAnalysis);

  // Estimate costs
  const totalEstimatedCost = estimateCosts(perStopAnalysis);

  // Generate Diaspora AI multi-city link
  const diasporaMultiCityLink = generateMultiCityLink(input);

  // Format response
  const formattedResponse = formatTripGuardResponse(
    input.stops.length,
    totalDays,
    visasRequired,
    totalEstimatedCost.visaFees,
    perStopAnalysis,
    layoverAlerts,
    combinedDocumentChecklist,
    suggestedOrder,
    orderingReason
  );

  console.log(`[TripGuard] Planning complete. ${visasRequired} visas required for ${input.stops.length} countries.`);

  return {
    tripSummary: {
      totalCountries: input.stops.length,
      totalDays,
      visasRequired,
      estimatedVisaCost: totalEstimatedCost.visaFees,
    },
    perStopAnalysis,
    layoverAlerts,
    combinedDocumentChecklist,
    suggestedOrder,
    orderingReason,
    totalEstimatedCost,
    diasporaMultiCityLink,
    formattedResponse,
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function generateMultiCityLink(input: TripGuardInput): string {
  const stops = input.stops.map(s => s.country).join(",");
  const nationality = input.nationality || input.passportCountry || "";
  const params = new URLSearchParams();
  params.append("from", nationality);
  params.append("destinations", stops);
  params.append("type", "multi-city");
  return `https://app.diasporaai.dev/multi-city?${params.toString()}`;
}

function formatTripGuardResponse(
  totalCountries: number,
  totalDays: number,
  visasRequired: number,
  visaCost: string,
  stops: PerStopAnalysis[],
  layovers: LayoverAlert[],
  checklist: CombinedDocument[],
  suggestedOrder: string[],
  orderingReason: string
): TripGuardOutput["formattedResponse"] {
  const header = `🗺️ TRIP PLANNER • ${totalCountries} countries • ${totalDays} days • ${visasRequired} visas needed • ${visaCost} estimated`;

  const summarySection = `
**Trip Overview**
• Total Countries: ${totalCountries}
• Total Duration: ${totalDays} days
• Visas Required: ${visasRequired}
• Estimated Visa Cost: ${visaCost}
`;

  const stopsSection = stops.map((s, i) => {
    const visaEmoji = s.visaRequired ? "🛂" : "✅";
    const advisoryEmoji = s.travelAdvisory === "none" ? "🟢" : 
                          s.travelAdvisory === "low" ? "🟡" :
                          s.travelAdvisory === "medium" ? "🟠" : "🔴";
    
    return `
**${i + 1}. ${s.countryName}** (${s.country})
${visaEmoji} Visa: ${s.visaRequired ? `Required - ${s.visaType}` : "Not required"}
${s.processingDays ? `⏱️ Processing: ${s.processingDays} days` : ""}
${s.estimatedCost ? `💰 Cost: ${s.estimatedCost}` : ""}
${advisoryEmoji} Advisory: ${s.travelAdvisory === "none" ? "No concerns" : s.advisoryNotes || s.travelAdvisory}
`.trim();
  }).join("\n\n");

  const alertsSection = layovers.length > 0
    ? layovers.map(l => {
        const emoji = l.transitVisaRequired ? "⚠️" : "✅";
        return `${emoji} **${l.airport}**: ${l.notes}`;
      }).join("\n")
    : "No layover alerts.";

  const checklistSection = checklist.slice(0, 10).map(doc => {
    const countries = doc.forCountries.length > 3 
      ? `${doc.forCountries.slice(0, 3).join(", ")}... (+${doc.forCountries.length - 3} more)`
      : doc.forCountries.join(", ");
    return `• ${doc.document} — needed for: ${countries}`;
  }).join("\n");

  const costSection = `
**💰 Recommended Visa Order:**
${suggestedOrder.map((c, i) => `${i + 1}. ${COUNTRY_NAMES[c] || c}`).join("\n")}

*${orderingReason}*
`;

  return {
    header,
    summarySection,
    stopsSection,
    alertsSection,
    checklistSection,
    costSection,
  };
}
