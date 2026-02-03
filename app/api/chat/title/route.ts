import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
    });

    // Create a prompt to generate a short title
    const conversationSummary = messages
      .slice(0, 4)
      .map((m: { role: string; content: string }) => `${m.role}: ${m.content}`)
      .join("\n");

    const prompt = `Based on this conversation, generate a very short title (3-5 words max) that captures the main topic. Only respond with the title, nothing else. No quotes, no punctuation at the end.

Conversation:
${conversationSummary}

Title:`;

    const result = await model.generateContent(prompt);
    const title = result.response.text().trim();

    return NextResponse.json({ title });
  } catch (error) {
    console.error("Title generation error:", error);
    // Return a fallback title based on first message
    return NextResponse.json({ title: "New Conversation" });
  }
}
