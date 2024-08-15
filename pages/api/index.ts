import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({
    message: "Please visit /api-docs for available routes and documentation.",
    docsUrl: `${process.env.NEXTAUTH_URL}/api-docs`,
  });
}
