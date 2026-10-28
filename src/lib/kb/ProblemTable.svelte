<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { uniqueById, type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
  import { groupByProblem, TICKET_URL } from '#lib/kb/problems';

  let { ticket }: { ticket: number } = $props();

  const rows = $derived((reports as Report[]).filter((r) => r.mergedInto === ticket));
  const unique = $derived(uniqueById(rows));
  const groups = $derived(groupByProblem(rows, ticket, tenantOf, notes.oneDayMove));
  const ticketOf = (p: string) => (p in TICKET_URL ? TICKET_URL[p as keyof typeof TICKET_URL] : null);
</script>

<p class="sum">
  <strong>{unique.length}</strong> reports in #{ticket} ({rows.length} rows in the export, {rows.length - unique.length} repeated) ·
  <strong>{groups.length}</strong> problems
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>tenants</th><th>seen</th><th>ticket</th></tr>
  </thead>
  <tbody>
    {#each groups as g (g.problem)}
      {@const url = ticketOf(g.problem)}
      <tr>
        <td><code>{g.problem}</code></td>
        <td>{g.reports.length}</td>
        <td>{g.tenants.length}</td>
        <td>{g.firstSeen} → {g.lastSeen}</td>
        <td>{#if url}<a href={url}>#{url.split('/').pop()}</a>{:else}none{/if}</td>
      </tr>
    {/each}
  </tbody>
</table>

{#each groups as g (g.problem)}
  {#if g.reports.length < 20}
    <p class="ids"><code>{g.problem}</code>: {g.reports.map((r) => r.id).join(', ')}</p>
  {/if}
{/each}

<style>
  .sum { font-size: 1.1rem; }
  .ids { color: var(--muted); font-size: 0.85em; }
</style>
