# Monitoring (Temporary)
Uses in-memory timers and the existing worker-thread scan queue. Daily scans run every 24 hours and weekly scans every 7 days from creation, resumption, or the last completed run. Only one timer per monitor and two monitor scans at a time are allowed. Run Now returns as soon as the scan is queued; refresh or wait for the page to update to see its result.

Schedules and results are cleared on backend restart. Each monitor retains at most 10 runs for up to 30 days; old regression baselines also expire after 30 days. No Redis, BullMQ, or database is used.
