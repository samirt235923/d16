import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(1200),
});

const chatInputSchema = z.object({
  messages: z.array(messageSchema).min(1).max(12),
});

const CHAT_MODELS = [
  "thinkingmachines/inkling-small:free",
  "deepgram/flux-tts:free",
  "dots-studio/dots-3-note-preview:free",
  "liquid/lfm-2.5-embedding-350m:free",
  "qwen/qwen3.8-27b:free",
  "inclusionai/ling-3.0-flash-fin:free",
  "nvidia/nemotron-3.5-lightning:free",
  "fish-audio/s2.1-pro-free:freev",
  "poolside/laguna-s-2.1:free",
] as const;

const systemMessage = {
  role: "system" as const,
  content:
    "You are the friendly customer support assistant for D16 Air Humidifier BD. Reply briefly in Bangla when the customer writes Bangla, otherwise reply in clear English. Help with product features, usage, pricing, delivery, and ordering. Never invent policies, medical claims, or availability. If you cannot answer, suggest WhatsApp Support.",
};

export const sendChatMessage = createServerFn({ method: "POST" })
  .validator(chatInputSchema)
  .handler(async ({ data }) => {
    const env = (globalThis as typeof globalThis & {
      process?: { env?: Record<string, string | undefined> };
    }).process?.env;
    const apiKey = env?.OPENROUTER_API_KEY;

    if (!apiKey) {
      throw new Error("Chat support is not configured yet.");
    }

    for (const model of CHAT_MODELS) {
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          signal: AbortSignal.timeout(15000),
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            messages: [systemMessage, ...data.messages],
          }),
        });

        if (!response.ok) continue;

        const result = (await response.json()) as {
          choices?: Array<{ message?: { content?: string | null } }>;
        };
        const content = result.choices?.[0]?.message?.content?.trim();

        if (content) return { content };
      } catch {
        continue;
      }
    }

    throw new Error("OpenRouter could not answer right now.");
  });