import ErrorWithStatus from "@/exception/custom-error";
import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "@/lib/redis";
import logger from "@/lib/logger";

const log = logger.child({ util: "Rate-limit" });

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, "1 m"),
});

const rateLimitIP = async (request: Request) => {
  log.info("Rate limit check");
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const { success } = await ratelimit.limit(ip);
  if (!success) {
    throw new ErrorWithStatus("Too Many Requests", 429);
  }
  return;
};

export default rateLimitIP;