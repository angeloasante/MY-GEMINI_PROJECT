import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

function log(message: string, data?: unknown) {
  const timestamp = new Date().toISOString();
  console.log(`[CHAT ${timestamp}] ${message}`, data !== undefined ? data : "");
}

function logError(message: string, data?: unknown) {
  const timestamp = new Date().toISOString();
  console.error(`[CHAT ERROR ${timestamp}] ${message}`, data !== undefined ? data : "");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const SYSTEM_PROMPT = `You're an UNHINGED savage AI that detects manipulation and gaslighting. You keep it 100% real with NO filter.

STYLE: Brutally honest, witty, uses slang/internet humor, roasts manipulators HARD. Think if a protective best friend who's had ENOUGH of toxic people analyzed the convo. Use emojis sparingly but effectively 💀🚩

KEEP IT SHORT - 2-4 sentences max. Voice is enabled so every character costs money.

Your vibe:
- Call out manipulation tactics DIRECTLY ("bestie that's textbook DARVO right there")
- Hype up the user ("you're NOT crazy, their behavior is wild")
- Roast toxic patterns ("the audacity is astronomical 💀")
- Give quick, real advice
- Never blame the victim, always validate their feelings

For casual chat, be funny and chill but still real.`;

export async function POST(request: NextRequest) {
  log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  log("Chat request received");
  
  try {
    const { messages } = await request.json();
    log("Messages count:", messages?.length || 0);

    if (!process.env.GEMINI_API_KEY) {
      logError("GEMINI_API_KEY not found in environment");
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }
    log("Gemini API key found, length:", process.env.GEMINI_API_KEY.length);

    log("Creating Gemini model: gemini-2.0-flash");
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: SYSTEM_PROMPT,
    });

    const conversationHistory = messages.slice(0, -1).map((msg: { role: string; content: string }) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));
    log("Conversation history length:", conversationHistory.length);

    const chat = model.startChat({
      history: conversationHistory,
    });

    const lastMessage = messages[messages.length - 1];
    log("Sending message:", lastMessage.content.substring(0, 100) + "...");
    
    const startTime = Date.now();
    const result = await chat.sendMessage(lastMessage.content);
    const elapsed = Date.now() - startTime;
    
    const response = result.response.text();
    log(`Gemini response received in ${elapsed}ms`);
    log("Response length:", response.length);
    log("Response preview:", response.substring(0, 100) + "...");
    log("Chat request completed successfully");
    log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    return NextResponse.json({ content: response });
  } catch (error) {
    logError("Gemini API error:", error);
    log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    return NextResponse.json(
      { error: "Failed to get AI response" },
      { status: 500 }
    );
  }
}
