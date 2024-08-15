import { util, z } from "zod";
import { shortenLinkSchema } from "@/schemas";
import isCustomSuffixInUse from "@/utils/check-custom-suffix";
import ErrorWithStatus from "@/exception/custom-error";
import logger from "@/lib/logger";

const log = logger.child({util: "Generate-suffix"})

const generateUniqueLink = async ({
  link,
  customSuffix,
}: z.infer<typeof shortenLinkSchema>): Promise<string> => {
  log.info("Function called")
  let isUnique: boolean = true;
  if (customSuffix) {
    isUnique = await isCustomSuffixInUse(customSuffix);
    if (isUnique) {
      throw new ErrorWithStatus("Custom suffix already in use", 400);
    }
    return `${customSuffix}`;
  }

  let suffix: string = "";
  

  while (isUnique) {
    suffix = "";
    const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

    for (let i = 0; i < 5; i++) {
      suffix += characters.charAt(
        Math.floor(Math.random() * characters.length),
      );
    }
    isUnique = await isCustomSuffixInUse(suffix);
  }
  return suffix;
};

export default generateUniqueLink;
