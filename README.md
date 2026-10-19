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

## Docker และ CI/CD

`next.config.ts` ใช้ `output: "standalone"`; `Dockerfile` เป็น multi-stage (deps, build, runner) รันเป็น user `node` ที่ port 3000 และมี HEALTHCHECK ที่ `/` (หน้าแรกโหลดรายการงานจาก browser ไม่เรียก API ตอน render ฝั่ง server)

### `API_PROXY_TARGET` เป็น build arg

`rewrites()` ถูกประเมินตอน `next build` และค่าถูกฝังใน `.next/routes-manifest.json` ส่วนหน้า `/events/[slug]` กับ calendar อ่าน `process.env.API_PROXY_TARGET` ฝั่ง server ตอนรัน ดังนั้น Dockerfile ส่งค่าเดียวกันเข้า image ทั้งตอน build และตอนรัน ไม่ต้องมี `.env` บน server ถ้าจะเปลี่ยน URL ของ API ต้อง build image ใหม่ ถ้าไม่ส่ง build arg การ build จะหยุดพร้อมข้อความ error ไม่มีหน้าไหนเรียก API ตอน build (หน้า event เป็น `force-dynamic`)

### รันบนเครื่องด้วย Docker Compose

```bash
API_PROXY_TARGET=http://host.docker.internal:4000 docker compose up -d --build
```

- ค่าเริ่มต้นของ build arg คือ `http://host.docker.internal:4000` (API ที่รันบนเครื่อง host)
- bind ที่ `127.0.0.1:3100` เท่านั้น (เปลี่ยนด้วย `PLATFORM_HOST_PORT`) ส่วน production ใช้ `3001` เพื่อไม่ชนกับ admin (3000)

### CI/CD

workflow: `.github/workflows/ci-cd.yml`

- pull request เข้า `main`: `typecheck`, `test` และ `build`
- push เข้า `main`: ตรวจเหมือนกัน แล้ว build/push `ghcr.io/warunyoo1/run-event-platform` (tag `latest` และ commit SHA) ด้วย `GITHUB_TOKEN` จากนั้น SSH เข้า server เพื่อ `pull platform`, `up -d`, รอ healthcheck และ `docker image prune -f`

GitHub ที่ต้องตั้งใน repo `run-event-platform` (Settings > Secrets and variables > Actions):

| ชื่อ | ประเภท | จำเป็น |
|---|---|---|
| `API_PROXY_TARGET` | variable (ตั้งเป็น secret ก็ได้) | ใช่ (production: `https://api.walkruntogive2027.com` ไม่มี `/` ท้าย) |
| `SSH_HOST`, `SSH_USER`, `SSH_KEY` | secret | ใช่ |
| `SSH_PORT` | secret | ไม่ (ค่าเริ่มต้น 22) |
| `SSH_KNOWN_HOSTS` | secret | แนะนำ |
| `DEPLOY_PATH` | variable หรือ secret | ไม่ (ค่าเริ่มต้น `/var/www/projects/run-event-platform`) |

### Deploy ครั้งแรกบน server

```bash
sudo mkdir -p /var/www/projects/run-event-platform
sudo chown <deploy-user>: /var/www/projects/run-event-platform
# คัดลอก docker-compose.prod.yml ไปไว้ที่โฟลเดอร์นี้ (workflow ไม่ได้ส่งไฟล์ให้)
#   scp docker-compose.prod.yml <user>@<server>:/var/www/projects/run-event-platform/
cd /var/www/projects/run-event-platform
docker compose -f docker-compose.prod.yml pull platform
docker compose -f docker-compose.prod.yml up -d
curl -I http://127.0.0.1:3001/     # ต้องได้ 200
```

server ต้อง login GHCR ไว้แล้ว (หรือตั้ง package เป็น public) ไม่ต้องมี `.env` เพราะไม่มี secret ตอนรัน

### nginx (DirectAdmin, nginx_apache) สำหรับ walkruntogive2027.com

สร้างไฟล์ `/etc/nginx/platform-site.conf` แล้ว include จาก `/etc/nginx/nginx-includes.conf` ต้องทำตามลำดับนี้ (ถ้ายังไม่มีใบรับรอง แล้วมีบล็อก HTTPS อยู่ `nginx -t` จะ fail ห้าม reload ก่อนมีใบรับรอง):

1. ตั้ง DNS A record ของ `walkruntogive2027.com` ไปที่ IP ของ server และรอให้ resolve
2. สร้างไฟล์ที่มีเฉพาะบล็อก HTTP

```nginx
# /etc/nginx/platform-site.conf   <-- ปรับ IP ให้ตรงกับของจริง
server {
    listen <server-ip>:80;
    server_name walkruntogive2027.com;

    location /.well-known/acme-challenge/ {
        root /var/www/letsencrypt;
    }

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
echo 'include /etc/nginx/platform-site.conf;' >> /etc/nginx/nginx-includes.conf
nginx -t && systemctl reload nginx
```

3. ออกใบรับรอง

```bash
certbot certonly --webroot -w /var/www/letsencrypt -d walkruntogive2027.com
ls /etc/letsencrypt/live/
```

4. เมื่อได้ใบรับรองแล้วเท่านั้น จึงเพิ่มบล็อก HTTPS ในไฟล์เดิม (และเปลี่ยน `location /` ของบล็อก HTTP เป็น `return 301 https://$host$request_uri;`)

```nginx
server {
    listen <server-ip>:443 ssl;
    http2 on;
    server_name walkruntogive2027.com;

    ssl_certificate     /etc/letsencrypt/live/walkruntogive2027.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/walkruntogive2027.com/privkey.pem;

    location / {
        client_max_body_size 8m;   # อัปโหลดสลิปผ่าน /api/v1/public (ให้ตรงกับฝั่ง API)
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

5. `nginx -t && systemctl reload nginx`

hook ให้ nginx โหลดใบรับรองใหม่หลัง certbot ต่ออายุ:

```bash
cat > /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh <<'EOF'
#!/bin/sh
systemctl reload nginx
EOF
chmod +x /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh
```

### ค่าที่ต้องตั้งฝั่ง API

- `CORS_ORIGINS` ไม่ต้องเพิ่ม origin ของเว็บนี้ เพราะ browser เรียก `/api/v1/public/*` แบบ same-origin (Next rewrite ไปที่ API) และฝั่ง server เรียก API ตรง (`src/lib/api.ts`) จะต้องเพิ่มก็ต่อเมื่อให้ browser เรียก API โดยตรง
- `API_PROXY_TARGET` (build arg) ต้องเป็น URL สาธารณะของ API: `https://api.walkruntogive2027.com`
- ถ้า API อยู่หลัง nginx ที่จำกัดขนาด body ให้รองรับการอัปโหลดสลิป
### Platform languages
The platform uses react-i18next with a local Thai/English UI dictionary in `src/i18n/en.json`. The header switch persists the selected language in localStorage and synchronizes browser tabs. Translation changes labels only; form option values and participant data remain unchanged. Dates use Buddhist years in Thai and Gregorian years in English. Organizer-authored names, descriptions, venues, policy text, and poster images remain in their original language. Add new UI copy to the dictionary and render it through UiText / translated controls. Unknown text falls back to the original.
