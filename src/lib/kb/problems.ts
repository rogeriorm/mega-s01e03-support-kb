// The problems #4471 really holds. causes.ts tells the two date-order bugs apart by tenant and
// channel; it never reads a report. The desk read some reports as a one-day move, not a flip
// (desk-notes.json). Those are a third problem, so they leave the cause they were filed under.
import { causeOf, uniqueById, type Cause, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = Cause | 'one-day-move' | 'unplaced';

// The desk's tickets for each problem, in the kb repo's issue tracker.
export const TICKET_URL: Record<Exclude<Problem, 'unplaced'>, string> = {
  parser: 'https://github.com/rogeriorm/mega-s01e03-support-kb/issues/1',
  hint: 'https://github.com/rogeriorm/mega-s01e03-support-kb/issues/2',
  'one-day-move': 'https://github.com/rogeriorm/mega-s01e03-support-kb/issues/3',
};

export function problemOf(r: Report, t: Tenant | undefined, oneDayMove: readonly string[]): Problem {
  if (oneDayMove.includes(r.id)) return 'one-day-move';
  return causeOf(r, t) ?? 'unplaced';
}

export type ProblemGroup = {
  problem: Problem;
  reports: Report[];
  tenants: string[];
  firstSeen: string;
  lastSeen: string;
};

export function groupByProblem(
  reports: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): ProblemGroup[] {
  const byProblem = new Map<Problem, Report[]>();
  for (const r of uniqueById(reports).filter((r) => r.mergedInto === ticket)) {
    const p = problemOf(r, tenantOf(r), oneDayMove);
    byProblem.set(p, [...(byProblem.get(p) ?? []), r]);
  }
  return [...byProblem.entries()]
    .map(([problem, rs]) => {
      const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
      return {
        problem,
        reports: rs,
        tenants: [...new Set(rs.map((r) => r.tenant))].sort(),
        firstSeen: days[0],
        lastSeen: days[days.length - 1],
      };
    })
    .sort((a, b) => b.reports.length - a.reports.length);
}
