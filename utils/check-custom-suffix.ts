import { getLinkByCustomSuffix } from "@/services/link-service";
import { reservedSuffixes } from "@/constants/data";
import logger from "@/lib/logger";

const log = logger.child({ util: "Check-custom-suffix" });

const isCustomSuffixInUse = async (customSuffix: string) => {
  log.info("Function called");
  const isReserved = reservedSuffixes.includes(customSuffix);
  if (isReserved) {
    return true;
  }
  const isExisting = !!(await getLinkByCustomSuffix(customSuffix));
  return isExisting;
};

export default isCustomSuffixInUse;
