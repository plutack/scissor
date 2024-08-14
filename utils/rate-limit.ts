import ErrorWithStatus from "@/exception/custom-error";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(60, "1 m"),
});

const rateLimitIP = async (request: Request) => {
  const ip = request.headers.get("x-forwarded-for") ?? "";
  const { success } = await ratelimit.limit(ip);
  if (!success) {
    throw new ErrorWithStatus("Too Many Requests", 429);
  }
  return;
};

export default rateLimitIP;
