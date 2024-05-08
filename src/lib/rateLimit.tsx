import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export const rateLimit = async ({
  limit,
  duration,
}: {
  limit: number;
  duration: number;
}) => {
  const rateLimit = new Ratelimit({
    limiter: Ratelimit.slidingWindow(limit, `${duration} s`),
    analytics: true,
    redis: Redis.fromEnv(),
  });

  return rateLimit;
};
