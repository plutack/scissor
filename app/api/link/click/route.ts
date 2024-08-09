import * as linkService from "@/services/link-service";

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { customSuffix, country }: { customSuffix: string; country: string } =
      body;

    if (!customSuffix || !country) {
      throw new Error("Missing customSuffix or country");
    }

    await linkService.updateDbOnLinkClick(customSuffix, country);

    return Response.json({ status: 204 });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error updating link click:", error); // TODO properly log error
    }
    return Response.json(
      { message: "Error updating link click" },
      { status: 500 },
    );
  }
}
