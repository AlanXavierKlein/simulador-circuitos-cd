import { Redis } from "@upstash/redis";

const VIEW_COUNT_KEY = "views:total";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function hasRedisCredentials() {
  const hasUrl = Boolean(
    process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL,
  );
  const hasToken = Boolean(
    process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN,
  );

  return hasUrl && hasToken;
}

function unavailableResponse() {
  return Response.json(
    { error: "El contador de visitas no está disponible por el momento." },
    {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    },
  );
}

export async function GET(request: Request) {
  if (!hasRedisCredentials()) {
    return unavailableResponse();
  }

  try {
    const redis = Redis.fromEnv();
    const readOnly = new URL(request.url).searchParams.get("read") === "1";
    const views = readOnly
      ? ((await redis.get<number>(VIEW_COUNT_KEY)) ?? 0)
      : await redis.incr(VIEW_COUNT_KEY);

    return Response.json(
      { views },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return unavailableResponse();
  }
}
