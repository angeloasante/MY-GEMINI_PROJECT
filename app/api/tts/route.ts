import { NextRequest, NextResponse } from "next/server";

const ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1/text-to-speech";
const VOICE_ID = "P7x743VjyZEOihNNygQ9";

function log(message: string, data?: unknown) {
  const timestamp = new Date().toISOString();
  console.log(`[TTS ${timestamp}] ${message}`, data !== undefined ? data : "");
}

function logError(message: string, data?: unknown) {
  const timestamp = new Date().toISOString();
  console.error(`[TTS ERROR ${timestamp}] ${message}`, data !== undefined ? data : "");
}

export async function POST(request: NextRequest) {
  log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  log("TTS Request received");
  
  try {
    const { text } = await request.json();
    log("Text length:", text?.length || 0);
    log("Text preview:", text?.substring(0, 100) + "...");

    if (!process.env.ELEVENLABS_API_KEY) {
      logError("ELEVENLABS_API_KEY not found in environment");
      return NextResponse.json(
        { error: "ElevenLabs API key not configured" },
        { status: 500 }
      );
    }
    log("API key found, length:", process.env.ELEVENLABS_API_KEY.length);

    const url = `${ELEVENLABS_API_URL}/${VOICE_ID}/with-timestamps?output_format=mp3_44100_128`;
    log("Calling ElevenLabs API:", url);
    log("Voice ID:", VOICE_ID);
    
    const startTime = Date.now();
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "xi-api-key": process.env.ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_turbo_v2_5",
        voice_settings: {
          stability: 0.3,
          similarity_boost: 0.8,
          style: 0.5,
          speed: 1.2,
        },
      }),
    });

    const elapsed = Date.now() - startTime;
    log(`ElevenLabs response received in ${elapsed}ms`);
    log("Response status:", response.status);
    log("Response statusText:", response.statusText);

    if (!response.ok) {
      const error = await response.text();
      logError("ElevenLabs API error:", { status: response.status, error });
      return NextResponse.json(
        { error: "Failed to generate speech", details: error },
        { status: response.status }
      );
    }

    const data = await response.json();
    log("Audio base64 length:", data.audio_base64?.length || 0);
    log("Alignment characters count:", data.alignment?.characters?.length || 0);
    log("TTS Request completed successfully");
    log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    return NextResponse.json({
      audio_base64: data.audio_base64,
      alignment: data.alignment,
    });
  } catch (error) {
    logError("TTS exception:", error);
    log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    return NextResponse.json(
      { error: "Failed to generate speech" },
      { status: 500 }
    );
  }
}
