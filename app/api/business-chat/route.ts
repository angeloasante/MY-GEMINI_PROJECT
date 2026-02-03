// API Route: /api/business-chat
// Business mode chat endpoint using Gemini 3

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const BUSINESS_SYSTEM_PROMPT = `You are a professional business assistant powered by Gemini 3. You help with:

1. Business inquiries and professional advice
2. Travel and visa information
3. Immigration guidance
4. Document analysis and preparation
5. Professional communication drafting
6. Business planning and strategy
7. Market research assistance

Be professional, concise, and helpful. Provide accurate information and always recommend verifying important details with official sources.

If asked about visa requirements, provide general guidance but always recommend checking with official embassy/consulate websites for the most current information.`;

function log(message: string, data?: unknown) {
  const timestamp = new Date().toISOString();
  console.log(`[BUSINESS-CHAT ${timestamp}] ${message}`, data !== undefined ? data : "");
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
        maxOutputTokens: 2048,
      },
    });

    // Send message with system prompt context
    const prompt = history.length === 0 
      ? `${BUSINESS_SYSTEM_PROMPT}\n\nUser: ${lastMessage.content}`
      : lastMessage.content;

    const result = await chat.sendMessage(prompt);
    const response = result.response;
    const text = response.text();

    log("Response generated successfully");
    log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    return NextResponse.json({ content: text });
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
