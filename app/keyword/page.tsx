"use client";

import { useState } from "react";
import { KeywordTable } from "@/components/KeywordTable";

export default function KeywordPage() {
  const [selectedDate, setSelectedDate] = useState("");

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <p className="mb-4 text-sm opacity-60">
        关键词分析记录（与 <code className="text-xs">keyword-data.jsonl</code> 字段一致：score、country、name、msg、time）。可按分数、时间排序，并按国家筛选。
      </p>
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <label className="form-control">
          <span className="mb-1 text-sm text-zinc-600 dark:text-zinc-400">日期</span>
          <input
            type="date"
            className="input input-bordered input-sm"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </label>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => setSelectedDate("")}
        >
          清空日期
        </button>
      </div>
      <KeywordTable selectedDate={selectedDate} />
    </main>
  );
}
