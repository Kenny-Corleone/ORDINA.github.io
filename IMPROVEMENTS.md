# Hardening improvements

- Third-party keys are read only from `VITE_*` environment variables; missing configuration now produces explicit unavailable states instead of placeholder data.
- Debt payments update the debt and corresponding expense in one Firestore batch, preventing partial writes.
- Recurring status writes use `setDoc(..., { merge: true })` so a missing status document is created safely.
- Firebase configuration is validated and exposes a typed initialization status.
- Dashboard data widgets distinguish loading, empty/error, and offline conditions.
- Weather SVG snippets are selected only from a fixed trusted allowlist.
- Vitest paths and browser polyfills are worktree/CI-safe.
