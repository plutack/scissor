import ErrorWithStatus from "@/exception/custom-error";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import logger from "@/lib/logger";

const log = logger.child({ util: "Rate-limit" });

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(60, "1 m"),
});

const rateLimitIP = async (request: Request) => {
  log.info("Rate limit check");
  const ip = request.headers.get("x-forwarded-for") ?? "";
  const { success } = await ratelimit.limit(ip);
  if (!success) {
    throw new ErrorWithStatus("Too Many Requests", 429);
  }
  return;
};

export default rateLimitIP;
