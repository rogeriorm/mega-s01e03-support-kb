// The problems #4471 really holds, counted the desk's way: each report under the cause causes.ts
// files it by tenant and channel. The reports the desk read as a one-day move (desk-notes.json)
// are a third problem; they stay counted where they are filed and also count for their own ticket.
import { groupByCause, readAs, uniqueById, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = 'parser' | 'hint' | 'one-day-move';

// The desk's ticket for each problem, in the kb repo's issue tracker, and where it stands.
export const TICKETS: Record<Problem, { url: string; state: string }> = {
  parser: { url: 'https://github.com/rogeriorm/mega-s01e03-support-kb/issues/1', state: 'fixed' },
  hint: { url: 'https://github.com/rogeriorm/mega-s01e03-support-kb/issues/2', state: "won't fix" },
  'one-day-move': { url: 'https://github.com/rogeriorm/mega-s01e03-support-kb/issues/3', state: 'open' },
};

export type ProblemRow = {
  problem: Problem;
  reports: Report[];
  tenants: number;
  firstSeen: string;
  lastSeen: string;
  alsoUnder: string | null;
};

export function problemsOf(
  reports: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): ProblemRow[] {
  const merged = uniqueById(reports).filter((r) => r.mergedInto === ticket);
  const groups = groupByCause(merged, tenantOf);
  const rows: ProblemRow[] = groups
    .filter((g) => g.cause !== 'unplaced')
    .map((g) => ({ problem: g.cause as Problem, reports: g.reports, tenants: g.tenants, firstSeen: g.firstSeen, lastSeen: g.lastSeen, alsoUnder: null }));
  const moved = merged.filter((r) => oneDayMove.includes(r.id));
  if (moved.length) {
    const days = moved.map((r) => r.receivedAt.slice(0, 10)).sort();
    const under = groups.filter((g) => readAs(g, oneDayMove) > 0).map((g) => g.cause).join(', ');
    rows.push({ problem: 'one-day-move', reports: moved, tenants: new Set(moved.map((r) => r.tenant)).size, firstSeen: days[0], lastSeen: days[days.length - 1], alsoUnder: under });
  }
  return rows;
}
