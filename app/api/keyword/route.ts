import { readFile, writeFile } from "node:fs/promises";

type KeywordRow = {
  score: number;
  country: string;
  name: string;
  msg: string;
  time: number;
  reviewed?: boolean;
  interested?: boolean;
};

const KEYWORD_JSONL_PATH = "/Users/xishengbo/Desktop/git-repo/keyword-analyse-bot/x/data.jsonl";

function parseJsonl(text: string): KeywordRow[] {
  const rows: KeywordRow[] = [];
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      const item = JSON.parse(trimmed) as KeywordRow;
      if (
        typeof item.score === "number" &&
        typeof item.country === "string" &&
        typeof item.name === "string" &&
        typeof item.msg === "string" &&
        typeof item.time === "number"
      ) {
        rows.push(item);
      }
    } catch {
      // Ignore malformed jsonl line.
    }
  }
  return rows;
}

export async function GET() {
  try {
    const text = await readFile(KEYWORD_JSONL_PATH, "utf-8");
    const rows = parseJsonl(text);
    return Response.json({ rows });
  } catch (error) {
    return Response.json(
      {
        rows: [],
        error: error instanceof Error ? error.message : "failed to read keyword data",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      time?: number;
      reviewed?: boolean;
      interested?: boolean;
    };
    const name = typeof body.name === "string" ? body.name : "";
    const time = typeof body.time === "number" ? body.time : NaN;
    const hasReviewed = typeof body.reviewed === "boolean";
    const hasInterested = typeof body.interested === "boolean";

    if (!name || Number.isNaN(time) || (!hasReviewed && !hasInterested)) {
      return Response.json({ ok: false, error: "invalid name or time" }, { status: 400 });
    }

    const text = await readFile(KEYWORD_JSONL_PATH, "utf-8");
    const rows = parseJsonl(text);

    let found = false;
    const updatedRows = rows.map((row) => {
      if (row.name === name && row.time === time) {
        found = true;
        const next = { ...row };
        if (hasReviewed) next.reviewed = body.reviewed;
        if (hasInterested) next.interested = body.interested;
        return next;
      }
      return row;
    });

    if (!found) {
      return Response.json({ ok: false, error: "record not found" }, { status: 404 });
    }

    const jsonl = `${updatedRows.map((row) => JSON.stringify(row)).join("\n")}\n`;
    await writeFile(KEYWORD_JSONL_PATH, jsonl, "utf-8");

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "failed to update keyword data",
      },
      { status: 500 },
    );
  }
}
