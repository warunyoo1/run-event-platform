# Run Event Platform

Public Next.js frontend connected to `running-event-api`.

## Run

Copy `.env.example` to `.env.local`. Set `API_PROXY_TARGET` to the API origin (no trailing slash). Run `npm ci` then `npm run dev` (port 3001).

The browser calls `/api/v1/public/*` through a Next rewrite. Server event pages use the same configured API target directly. Restart/rebuild after changing the target. No admin credentials are needed by the public app, and admin routes are not proxied.

## Connected flows

- Event catalogue and saved-event catalogue load published API events. Search/filter/sort runs on that complete list; saved IDs remain in localStorage.
- Event details, images, available race quotas, registration page and calendar load from the API. Draft and archived visibility is decided by the API. Missing event is a 404; connection errors show a retry page.
- Registration sends participants and delivery to `POST /events/:slug/orders`. The API calculates the final amount. The receipt uses the returned order number, total and expiry. Personal form values are cleared after success and never stored in browser storage.
- Lookup requires order number plus contact phone last four digits. Returned `canUploadSlip` controls multipart slip upload. Rejected slips can be resubmitted when the API allows it.
- QR/account/payment recipient configuration is intentionally deferred. The app does not invent payment instructions or process payments.

`NEXT_PUBLIC_SHIPPING_FEE` is the estimate shown before checkout (default 50); keep it aligned with API `SHIPPING_FEE`. The server-returned amount is authoritative. A network failure after checkout can be ambiguous: never assume no order was created.

Public lookup currently exposes no BIB or tracking fields because the existing API does not return them. No API behavior was changed.

## Checks

`npm run typecheck`, `npm run build`, `npm test`.

For isolated HTTP integration tests (no real orders):

```powershell
postman simulation run postman/simulations/public-checkout.sim.yaml --port 4900 --no-history --output ndjson
# In another terminal:
$env:SIMULATION_API_URL = "http://127.0.0.1:4900/running"
npm test
```

The local mock is based on the checked-in API route/validator/view contract, not a published workspace mock. It covers event listing/detail, create, lookup, multipart submission and 404/409 errors. It does not replace backend tests for quota concurrency, magic-byte validation, database persistence or expiry.

Set `API_PROXY_TARGET=http://127.0.0.1:4900/running` to browse the app against the same simulation. Do not use this setting for production. No mock was published. The untracked nested `run-event-platform/` copy is not the active source and was left untouched.
