import { z } from "zod";
import { shortenLinkSchema } from "@/schemas";
import { db } from "@/lib/db";

export const generateUniqueLink = async ({
  link,
  customSuffix,
}: z.infer<typeof shortenLinkSchema>): Promise<string> => {
  let isUnique: boolean = false;
  if (customSuffix) {
    isUnique = !(await db.link.findFirst({ where: { customSuffix } }));
    if (!isUnique) {
      throw new Error("Custom suffix already exists");
    }
    return `${customSuffix}`;
  }

  let suffix: string = "";
  console.log("Generating unique link");

  while (!isUnique) {
    suffix = "";
    const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

    for (let i = 0; i < 5; i++) {
      suffix += characters.charAt(
        Math.floor(Math.random() * characters.length),
      );
    }
    isUnique = !(await db.link.findFirst({ where: { customSuffix: suffix } }));
  }

  return suffix;
};
