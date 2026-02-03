import { createBrowserClient } from "@supabase/ssr";

// Types for user chats
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  imageBase64?: string;
  mimeType?: string;
}

export interface UserChat {
  id: string;
  user_id: string;
  mode: "personal" | "business";
  title: string;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
}

// Create client for component use
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Chat operations
export async function getUserChats(userId: string, mode?: "personal" | "business") {
  const supabase = createClient();
  
  let query = supabase
    .from("user_chats")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
  
  if (mode) {
    query = query.eq("mode", mode);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data as UserChat[];
}

export async function getChatById(chatId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from("user_chats")
    .select("*")
    .eq("id", chatId)
    .single();
  
  if (error) throw error;
  return data as UserChat;
}

export async function createChat(
  userId: string,
  mode: "personal" | "business",
  title: string = "New Chat",
  messages: ChatMessage[] = []
) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from("user_chats")
    .insert({
      user_id: userId,
      mode,
      title,
      messages,
    })
    .select()
    .single();
  
  if (error) throw error;
  return data as UserChat;
}

export async function updateChat(
  chatId: string,
  updates: Partial<Pick<UserChat, "title" | "messages">>
) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from("user_chats")
    .update(updates)
    .eq("id", chatId)
    .select()
    .single();
  
  if (error) throw error;
  return data as UserChat;
}

export async function deleteChat(chatId: string) {
  const supabase = createClient();
  
  const { error } = await supabase
    .from("user_chats")
    .delete()
    .eq("id", chatId);
  
  if (error) throw error;
}
