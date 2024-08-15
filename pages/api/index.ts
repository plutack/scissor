import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  response.status(200).json({
    message: "Please visit /api-docs for available routes and documentation.",
    docsUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api-docs`,
  });
}
