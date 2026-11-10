For the feature just finished:

1. Run `npm run lint` and `npm run build`. Fix errors before continuing.
2. Tick the finished task in `docs/dev-plan.md` (`- [x]` plus date at end of line, only if its "Done when" is fully met) and update dev-plan.md per the CLAUDE.md rules (Change log line if tasks, prompts or "Done when" changed).
3. Update `docs/PROGRESS.md`: add the task to Done (date, task id, one line, key files), update current status, add any decisions, issues or tech debt.
4. If migrations changed, update `docs/DATABASE.md` (tables, constraint, RLS, cron, buckets) from `supabase/migrations/` only.
5. Update `docs/ARCHITECTURE.md` and `README.md` only if structure, integrations or features changed.
6. Show a one-line commit message.

Keep doc edits short and factual. Never paste code into docs. Never write secrets or key values into any doc.
