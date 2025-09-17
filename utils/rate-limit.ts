import ErrorWithStatus from "@/exception/custom-error";
import { RateLimiterRedis } from "rate-limiter-flexible";
import { redis } from "@/lib/redis";
import logger from "@/lib/logger";

const log = logger.child({ util: "Rate-limit" });

const limiter = new RateLimiterRedis({
	storeClient: redis,
	points: 60,
	duration: 60,
	keyPrefix: "rate-limit",
});

const rateLimitIP = async (request: Request) => {
	log.info("Rate limit check");
	const ip = request.headers.get("x-forwarded-for") ?? "unknown";
	try {
		await limiter.consume(ip);
	} catch {
		throw new ErrorWithStatus("Too Many Requests", 429);
	}
};

export default rateLimitIP;
