import { NextRequest, NextResponse } from "next/server";
import { sendAuditEmail } from "@/lib/email";

// Internal webhook — called after every audit completes
// POST /api/webhooks/audit-complete
// Body: { userId, email, name, url, score, dims }

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET ?? "roastlab-internal";

export async function POST(req: NextRequest) {
  const auth = req.headers.get("x-webhook-secret");
  if (auth !== WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json() as {
      email: string;
      name?: string;
      url: string;
      score: number;
      dims: unknown[];
    };

    const { email, name, url, score, dims } = body;

    if (!email || !url) {
      return NextResponse.json({ error: "Missing email or url" }, { status: 400 });
    }

    await sendAuditEmail({
      to: email,
      name,
      url,
      score,
      dims: dims as Parameters<typeof sendAuditEmail>[0]["dims"],
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[webhook/audit-complete]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
