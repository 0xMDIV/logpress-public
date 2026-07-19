<p align="center">
  <img src="docs/hero.svg" alt="LogPress AI — AI-powered workout tracking" width="100%">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/platform-PWA%20%7C%20iOS%20%7C%20Android-blue" alt="platform">
  <img src="https://img.shields.io/badge/Vue%203-3.5-4FC08D" alt="vue">
  <img src="https://img.shields.io/badge/TypeScript-6-blue" alt="typescript">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="license">
</p>

A fitness tracking app that logs workouts, tracks sets and reps, and generates AI-powered fitness scores. Available as a **Progressive Web App** (iOS/Android installable) and the original **React Native** app.

> **PWA** — `web/` (Vue 3 + Vite)  
> **React Native (legacy)** — root directory

---

## 🚀 Stack Overview

| Layer | Technology |
|-------|-----------|
| **Frontend** | Vue 3 · Vite · TypeScript · Pinia · Vue Router |
| **Backend / Auth** | Supabase (self-hosted via Docker) |
| **AI** | Requesty API (OpenAI-kompatibel, via Supabase Edge Function) |
| **Analytics** | Supabase (eigene `analytics_events`-Tabelle) |
| **Offline** | Dexie.js (IndexedDB) · Workbox Service Worker |
| **PWA** | vite-plugin-pwa · Web App Manifest |
| **i18n** | i18next · 16 Sprachen |

---

## 📦 Komplett-Setup auf frischem Ubuntu Server

### 1. Server-Grundinstallation

```bash
# System aktualisieren
sudo apt update && sudo apt upgrade -y

# Docker installieren
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
# → Danach aus- und wieder einloggen (oder `newgrp docker`)

# Docker Compose (Plugin)
sudo apt install docker-compose-plugin -y

# Nginx
sudo apt install nginx certbot python3-certbot-nginx -y

# Git
sudo apt install git -y

# Node.js 22+
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install nodejs -y
```

### 2. Projekt klonen

```bash
cd /opt
sudo git clone https://github.com/0xMDIV/logpress-public.git
sudo chown -R $USER:$USER logpress-public
cd logpress-public
```

### 3. Supabase (self-hosted via Docker)

Supabase wird als separater Docker-Stack direkt neben der App betrieben.

```bash
cd /opt
git clone --depth 1 https://github.com/supabase/docker
cd docker

# Standard-Konfiguration kopieren
cp .env.example .env
```

**Wichtige Werte in `.env` setzen:**

```bash
nano .env
```

Mindestens diese ändern:

| Variable | Beispiel | Hinweis |
|----------|----------|---------|
| `POSTGRES_PASSWORD` | `dein_sicheres_passwort` | Datenbank-Passwort |
| `JWT_SECRET` | `openssl rand -hex 32` ausführen und eintragen | Wichtig für Auth |
| `ANON_KEY` | `openssl rand -hex 32` | Public API Key (darf im Browser landen) |
| `SERVICE_ROLE_KEY` | `openssl rand -hex 32` | Secret — niemals im Frontend nutzen |
| `SITE_URL` | `https://deine-domain.de` | Für Auth-Redirects |

**Keys generieren:**

```bash
# Zwei sichere Keys erzeugen
openssl rand -hex 32   # für JWT_SECRET
openssl rand -hex 32   # für ANON_KEY / SERVICE_ROLE_KEY
```

Jetzt starten:

```bash
docker compose up -d
```

Nach ein paar Minuten läuft Supabase unter:

| Dienst | URL |
|--------|-----|
| **Studio (Dashboard)** | `http://DEINE_SERVER_IP:3000` |
| **API (Kong)** | `http://DEINE_SERVER_IP:8000` |
| **Postgres** | `localhost:5432` (intern) |

**Supabase Studio aufrufen:**  
Browser → `http://DEINE_SERVER_IP:3000` → mit dem `ANON_KEY` aus `.env` einloggen.

### 4. Datenbank-Tabellen anlegen

Im Supabase Studio → **SQL Editor** → folgende SQL ausführen:

```sql
-- Datei: migrations/analytics_events.sql (im Projekt enthalten)
-- Einfach den Inhalt der Datei kopieren und ausführen
```

Die Tabellen für `profiles`, `workouts`, `routines` etc. erstellt Supabase automatisch, sobald die Edge Function oder die App darauf zugreift — oder du legst sie im SQL Editor an (siehe `migrations/`-Ordner für weitere SQL-Skripte).

**Edge Function deployen:**

```bash
cd /opt/logpress-public/web

# Supabase CLI installieren
npm install -g supabase

# Supabase verbinden (Kong-URL + Service Role Key)
supabase link --project-ref local \
  --project-url http://DEINE_SERVER_IP:8000

# Requesty-API-Key als Secret setzen
supabase secrets set REQUESTY_API_KEY=sk-dein-requesty-key
supabase secrets set REQUESTY_BASE_URL=https://router.requesty.ai/v1
supabase secrets set REQUESTY_MODEL=gpt-4o-mini

# Edge Function deployen
supabase functions deploy ai-score
```

### 5. PWA konfigurieren & bauen

```bash
cd /opt/logpress-public

# .env erstellen (Vorlage kopieren)
cp .env.example .env
nano .env
```

`.env` ausfüllen:

```env
VITE_SUPABASE_URL=http://DEINE_SERVER_IP:8000
VITE_SUPABASE_ANON_KEY=dein_anon_key_aus_supabase_env
```

Dann bauen:

```bash
cd /opt/logpress-public/web
npm install
npm run build
```

→ Das fertige PWA liegt in `web/dist/`.

### 6. Nginx-Reverse-Proxy (Empfohlen)

Statt IP + Port bekommst du saubere Domains. Dieser Config proxyt **Supabase UND die PWA unter einer Domain**:

```nginx
# /etc/nginx/sites-available/logpress
server {
    listen 80;
    server_name deine-domain.de;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name deine-domain.de;

    # SSL (siehe Schritt 7)
    ssl_certificate /etc/letsencrypt/live/deine-domain.de/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/deine-domain.de/privkey.pem;

    # PWA (statische Dateien)
    root /opt/logpress-public/web/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Supabase API (wird von der PWA benötigt)
    location /supabase/ {
        rewrite ^/supabase/(.*) /$1 break;
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }

    # Supabase Studio (optional — nur für Admins freigeben)
    location /studio/ {
        rewrite ^/studio/(.*) /$1 break;
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

Aktivieren:

```bash
sudo ln -s /etc/nginx/sites-available/logpress /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

**.env anpassen** (damit die PWA die proxied Supabase-URL nutzt):

```env
VITE_SUPABASE_URL=https://deine-domain.de/supabase
VITE_SUPABASE_ANON_KEY=dein_anon_key
```

PWA neu bauen:

```bash
cd /opt/logpress-public/web
npm run build
```

### 7. SSL mit Let's Encrypt

```bash
sudo certbot --nginx -d deine-domain.de
```

Automatische Verlängerung testen:

```bash
sudo certbot renew --dry-run
```

### 8. App in Supabase als Site URL eintragen

Supabase Studio → **Authentication** → **URL Configuration**:

| Feld | Wert |
|------|------|
| `Site URL` | `https://deine-domain.de` |
| `Redirect URLs` | `https://deine-domain.de` |

---

## 🔧 Wartung

### Supabase aktualisieren

```bash
cd /opt/docker
docker compose pull
docker compose up -d
```

### PWA neu bauen (nach Code-Änderungen)

```bash
cd /opt/logpress-public
git pull
cd web
npm install
npm run build
sudo systemctl reload nginx
```

### Logs

```bash
docker compose logs -f         # Supabase-Logs
sudo journalctl -u nginx -f    # Nginx-Logs
```

---

## 🧪 Lokale Entwicklung

```bash
cd web
npm run dev
# → http://localhost:5173
```

Der Dev-Server hot-reloaded bei Änderungen. Die Supabase-API muss erreichbar sein (lokal oder per SSH-Tunnel).

---

## 📁 Projektstruktur

```
├── web/                          # Vue 3 PWA
│   ├── src/
│   │   ├── router/               # Vue Router (alle Routen)
│   │   ├── stores/               # Pinia (user, workout, settings)
│   │   ├── services/             # Supabase, AI, DB (Dexie), Analytics, Offline
│   │   ├── views/                # Seiten (onboarding, workout, stats, profile)
│   │   └── components/           # UI-Komponenten
│   ├── supabase/functions/       # Edge Function (ai-score → Requesty)
│   └── vite.config.ts            # PWA-Konfiguration
├── src/                          # React Native (legacy)
├── migrations/                   # SQL-Migrationen für Supabase
└── .env.example                  # Vorlage für .env
```

---

## License

[MIT](LICENSE)
