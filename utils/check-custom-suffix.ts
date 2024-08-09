import { getLinkByCustomSuffix } from "@/services/link-service";
import { reservedSuffixes } from "@/constants/data";

const isCustomSuffixInUse = async (customSuffix: string) => {
  const isReserved = reservedSuffixes.includes(customSuffix);
  if (isReserved) {
    return true;
  }
  const isExisting = !!(await getLinkByCustomSuffix(customSuffix));
  return isExisting;
};

export default isCustomSuffixInUse;
