import { ModelMessage } from "ai";
import { env } from "cloudflare:workers";

export const saveMessages = async ({
  agent,
  messages,
  threadId,
}: {
  agent: string;
  threadId: string;
  messages: ModelMessage[];
}) => {
  const key = `${agent}:${threadId}`;
  const value = JSON.stringify(messages);
  await env.SQL_AGENT_KV.put(key, value);
  return true;
};

export const getMessages = async ({
  agent,
  threadId,
}: {
  agent: string;
  threadId: string;
}) => {
  const key = `${agent}:${threadId}`;
  const read = await env.SQL_AGENT_KV.get(key, "text");
  if (!read) {
    return [{ role: "user", content: "no message history." }] as ModelMessage[];
  }
  const parsed = JSON.parse(read) as ModelMessage[];
  return parsed;
};
