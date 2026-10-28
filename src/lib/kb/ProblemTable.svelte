<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { uniqueById, type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
  import { problemsOf, TICKETS } from '#lib/kb/problems';

  let { ticket }: { ticket: number } = $props();

  const rows = $derived((reports as Report[]).filter((r) => r.mergedInto === ticket));
  const unique = $derived(uniqueById(rows));
  const problems = $derived(problemsOf(rows, ticket, tenantOf, notes.oneDayMove));
</script>

<p class="sum">
  <strong>{unique.length}</strong> reports in #{ticket} ({rows.length} rows in the export, {rows.length - unique.length} repeated) ·
  <strong>{problems.length}</strong> problems
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>tenants</th><th>seen</th><th>ticket</th><th>state</th></tr>
  </thead>
  <tbody>
    {#each problems as p (p.problem)}
      <tr>
        <td><code>{p.problem}</code></td>
        <td>{p.reports.length}</td>
        <td>{p.tenants}</td>
        <td>{p.firstSeen} → {p.lastSeen}</td>
        <td><a href={TICKETS[p.problem].url}>#{TICKETS[p.problem].url.split('/').pop()}</a></td>
        <td>{TICKETS[p.problem].state}</td>
      </tr>
    {/each}
  </tbody>
</table>

{#each problems as p (p.problem)}
  {#if p.alsoUnder}
    <p class="ids"><code>{p.problem}</code>: {p.reports.map((r) => r.id).join(', ')}; also counted under <code>{p.alsoUnder}</code>, where the desk files them by tenant.</p>
  {/if}
{/each}

<style>
  .sum { font-size: 1.1rem; }
  .ids { color: var(--muted); font-size: 0.85em; }
</style>
