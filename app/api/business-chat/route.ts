// API Route: /api/business-chat
// Business mode chat endpoint using Gemini 3 - with itinerary creation

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { enrichItinerary } from "@/lib/itinerary/places";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const BUSINESS_SYSTEM_PROMPT = `You are a professional business assistant powered by Gemini 3. You help with:

1. Business inquiries and professional advice
2. Travel planning and itinerary creation
3. Visa and immigration guidance
4. Document analysis and preparation
5. Professional communication drafting
6. Business planning and strategy

## CRITICAL: Itinerary Detection & Format

When a user asks you to plan a trip, create an itinerary, or help with travel plans, you MUST:
1. First respond conversationally acknowledging their request
2. Then generate a COMPLETE JSON itinerary in a code block

Trigger phrases that mean "create an itinerary":
- "plan a trip to..."
- "create an itinerary for..."
- "I want to visit..."
- "help me plan..."
- "travel to..."
- "vacation in..."
- "going to [destination]..."

When triggered, ALWAYS include this JSON format in your response:

\`\`\`json
{
  "type": "itinerary",
  "title": "Trip to [Destination]",
  "destination": "[City, Country]",
  "start_date": "YYYY-MM-DD",
  "end_date": "YYYY-MM-DD",
  "travel_style": "adventure|cultural|relaxation|foodie|romantic|family|budget",
  "budget_level": "budget|mid-range|luxury",
  "days": [
    {
      "day_number": 1,
      "title": "Day 1 Title",
      "date": "YYYY-MM-DD",
      "activities": [
        {
          "time": "09:00 AM",
          "title": "Activity Name",
          "type": "flight|hotel|restaurant|attraction|transport",
          "location": "Full address or location name, City",
          "description": "Brief description of the activity",
          "duration": "2 hours",
          "price": "$50",
          "tips": ["Tip 1", "Tip 2"]
        }
      ]
    }
  ]
}
\`\`\`

IMPORTANT:
- Include at least 4-6 activities per day
- Include specific location names that can be geocoded
- Mix activity types (attractions, restaurants, transport)
- Include realistic times and durations
- Add helpful tips for each activity
- Be specific with addresses/locations

For non-itinerary questions, respond normally as a business assistant.`;

function log(message: string, data?: unknown) {
  const timestamp = new Date().toISOString();
  console.log(`[BUSINESS-CHAT ${timestamp}] ${message}`, data !== undefined ? data : "");
}

// Extract JSON itinerary from response
function extractItineraryJson(text: string): { itinerary: unknown; cleanText: string } | null {
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (!jsonMatch) return null;
  
  try {
    const parsed = JSON.parse(jsonMatch[1]);
    if (parsed.type === "itinerary" && parsed.days) {
      // Remove the JSON block from the response text
      const cleanText = text.replace(/```json\s*[\s\S]*?\s*```/, "").trim();
      return { itinerary: parsed, cleanText };
    }
  } catch {
    log("Failed to parse itinerary JSON");
  }
  return null;
}

export async function POST(request: NextRequest) {
  log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  log("Business chat request received");

  try {
    const body = await request.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    log("Creating Gemini model: gemini-3-flash-preview");
    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
      systemInstruction: BUSINESS_SYSTEM_PROMPT,
    });

    // Build conversation history
    const history = messages.slice(0, -1).map((msg: { role: string; content: string }) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    const lastMessage = messages[messages.length - 1];

    log("Starting chat with history length:", history.length);

    const chat = model.startChat({
      history,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
      },
    });

    const result = await chat.sendMessage(lastMessage.content);
    const response = result.response;
    const text = response.text();

    log("Response generated successfully");

    // Check if response contains an itinerary
    const itineraryResult = extractItineraryJson(text);
    
    if (itineraryResult) {
      log("Itinerary Detected, enriching with Places API...");
      
      try {
        // Type-cast the itinerary to access its properties
        const rawItinerary = itineraryResult.itinerary as {
          type: string;
          title: string;
          destination: string;
          start_date?: string;
          end_date?: string;
          travel_style?: string;
          budget_level?: string;
          days: Array<{
            day_number: number;
            date?: string;
            title: string;
            description?: string;
            activities?: Array<{
              title: string;
              type: string;
              location?: string;
              description?: string;
              time?: string;
              price?: string;
              action_label?: string;
            }>;
          }>;
        };

        // Enrich the itinerary with Google Places data
        const enrichedDays = await enrichItinerary(rawItinerary.days, rawItinerary.destination);
        
        // Rebuild the full itinerary with enriched days
        const enrichedItinerary = {
          ...rawItinerary,
          days: enrichedDays,
        };
        
        log("Itinerary enriched successfully");
        log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

        return NextResponse.json({ 
          content: itineraryResult.cleanText,
          itinerary: enrichedItinerary,
          hasItinerary: true,
        });
      } catch (enrichError) {
        log("Failed to enrich itinerary, returning without enrichment:", enrichError);
        return NextResponse.json({ 
          content: itineraryResult.cleanText,
          itinerary: itineraryResult.itinerary,
          hasItinerary: true,
        });
      }
    }

    log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    return NextResponse.json({ content: text, hasItinerary: false });
  } catch (error) {
    console.error("Business chat error:", error);
    log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    return NextResponse.json(
      { 
        error: "Failed to generate response",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
