import { NextRequest, NextResponse } from "next/server";
import { adminRoute, NO_STORE } from "@/lib/admin/route";
import { getProcurementWindows } from "@/lib/admin/procurement";

export async function GET(request: NextRequest) {
  return adminRoute(request, "procurement-windows", async () =>
    NextResponse.json(await getProcurementWindows(), { headers: NO_STORE }),
  );
}
