import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  response.status(200).json({
    message: "Please visit /api-docs for available routes and documentation.",
    docsUrl: `${process.env.COOLIFY_URL}/api-docs`,
  });
}
