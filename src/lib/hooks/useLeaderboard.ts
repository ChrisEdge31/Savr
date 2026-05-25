"use client";

import { useState, useEffect } from "react";
import { getDocs, query, orderBy, limit } from "firebase/firestore";
import { leaderboardCol, LeaderboardEntry } from "@/lib/firebase/firestore";

export type RankedEntry = LeaderboardEntry & { uid: string; rank: number };

export function useLeaderboard(count = 50) {
  const [entries, setEntries] = useState<RankedEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      const snap = await getDocs(query(leaderboardCol(), orderBy("points", "desc"), limit(count)));
      setEntries(
        snap.docs.map((d, i) => ({ ...d.data(), uid: d.id, rank: i + 1 }))
      );
      setLoading(false);
    }
    fetch();
  }, [count]);

  return { entries, loading };
}
