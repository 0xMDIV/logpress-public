#!/usr/bin/env bash
set -euo pipefail

# ──────────────────────────────────────────────
# LogPress — Full Stack Installer
# Ubuntu 22.04+ / Docker / Supabase / PWA
# ──────────────────────────────────────────────

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
info()  { echo -e "${CYAN}[INFO]${NC} $1"; }
ok()    { echo -e "${GREEN}[OK]${NC}   $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
err()   { echo -e "${RED}[ERR]${NC}  $1"; }

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
SUPABASE_DIR="$PROJECT_DIR/../supabase-docker"
DOMAIN=""
USE_DOMAIN=false
SERVER_IP=""

# ──────────────────────────────────────────────
# 1. System dependencies
# ──────────────────────────────────────────────
install_system_deps() {
  info "Updating system packages..."
  sudo apt update && sudo apt upgrade -y

  local pkgs=()
  if ! command -v docker &>/dev/null; then
    pkgs+=(docker)
  fi
  if ! command -v nginx &>/dev/null; then
    pkgs+=(nginx)
  fi
  if ! command -v certbot &>/dev/null; then
    pkgs+=(certbot python3-certbot-nginx)
  fi
  if ! command -v git &>/dev/null; then
    pkgs+=(git)
  fi
  if ! command -v node &>/dev/null || [[ "$(node -v | cut -d. -f1 | tr -d v)" -lt 22 ]]; then
    pkgs+=(nodejs)
  fi
  if [[ ${#pkgs[@]} -gt 0 ]]; then
    info "Installing: ${pkgs[*]}"
    if [[ " ${pkgs[*]} " =~ " nodejs " ]]; then
      curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
    fi
    sudo apt install -y "${pkgs[@]}"
  fi

  if ! command -v docker &>/dev/null; then
    curl -fsSL https://get.docker.com | sh
    sudo usermod -aG docker "$USER"
  fi

  if ! docker compose version &>/dev/null; then
    sudo apt install -y docker-compose-plugin
  fi

  ok "System dependencies installed"
}

# ──────────────────────────────────────────────
# 2. Clone / update repos
# ──────────────────────────────────────────────
setup_repos() {
  if [[ ! -d "$PROJECT_DIR/.git" ]]; then
    warn "This script must be run from inside the logpress-public repo."
    warn "Clone it first: git clone https://github.com/0xMDIV/logpress-public.git"
    exit 1
  fi
  ok "Project found at $PROJECT_DIR"

  if [[ ! -d "$SUPABASE_DIR" ]]; then
    info "Cloning Supabase Docker..."
    git clone --depth 1 https://github.com/supabase/docker "$SUPABASE_DIR"
    ok "Supabase Docker cloned"
  else
    info "Supabase Docker already exists — pulling latest..."
    cd "$SUPABASE_DIR" && git pull && cd "$PROJECT_DIR"
    ok "Supabase Docker updated"
  fi
}

# ──────────────────────────────────────────────
# 3. Generate secure keys
# ──────────────────────────────────────────────
generate_keys() {
  JWT_SECRET=$(openssl rand -hex 32)
  ANON_KEY=$(openssl rand -hex 32)
  SERVICE_ROLE_KEY=$(openssl rand -hex 32)
  POSTGRES_PASSWORD=$(openssl rand -hex 16)
  ok "Secure keys generated"
}

# ──────────────────────────────────────────────
# 4. Configure Supabase .env
# ──────────────────────────────────────────────
setup_supabase_env() {
  local env_file="$SUPABASE_DIR/.env"

  if [[ -f "$env_file" ]] && grep -q "SUPABASE_URL" "$env_file" 2>/dev/null; then
    info "Supabase .env already configured — skipping"
    return
  fi

  cp "$SUPABASE_DIR/.env.example" "$env_file"

  sed -i "s/^POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=$POSTGRES_PASSWORD/" "$env_file"
  sed -i "s/^JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" "$env_file"
  sed -i "s/^anon_key=.*/anon_key=$ANON_KEY/" "$env_file" 2>/dev/null || true
  sed -i "s/^ANON_KEY=.*/ANON_KEY=$ANON_KEY/" "$env_file" 2>/dev/null || true
  sed -i "s/^service_role_key=.*/service_role_key=$SERVICE_ROLE_KEY/" "$env_file" 2>/dev/null || true
  sed -i "s/^SERVICE_ROLE_KEY=.*/SERVICE_ROLE_KEY=$SERVICE_ROLE_KEY/" "$env_file" 2>/dev/null || true

  if $USE_DOMAIN; then
    sed -i "s|^SITE_URL=.*|SITE_URL=https://$DOMAIN|" "$env_file"
  else
    sed -i "s|^SITE_URL=.*|SITE_URL=http://$SERVER_IP:8000|" "$env_file"
  fi

  ok "Supabase .env configured"
}

# ──────────────────────────────────────────────
# 5. Start Supabase
# ──────────────────────────────────────────────
start_supabase() {
  info "Starting Supabase Docker stack (first pull may take a while)..."
  cd "$SUPABASE_DIR"
  docker compose pull
  docker compose up -d
  cd "$PROJECT_DIR"
  ok "Supabase is running"
  info "  Studio: http://$SERVER_IP:3000"
  info "  API:    http://$SERVER_IP:8000"
  warn "Log into Studio with ANON_KEY as password"
}

# ──────────────────────────────────────────────
# 6. Configure App .env
# ──────────────────────────────────────────────
setup_app_env() {
  local env_file="$PROJECT_DIR/.env"

  if [[ -f "$env_file" ]]; then
    info "App .env already exists — keeping it"
    return
  fi

  cp "$PROJECT_DIR/.env.example" "$env_file"

  sed -i "s|^VITE_SUPABASE_URL=.*|VITE_SUPABASE_URL=http://$SERVER_IP:8000|" "$env_file"
  sed -i "s|^SUPABASE_URL=.*|SUPABASE_URL=http://$SERVER_IP:8000|" "$env_file"
  sed -i "s/^VITE_SUPABASE_ANON_KEY=.*/VITE_SUPABASE_ANON_KEY=$ANON_KEY/" "$env_file"
  sed -i "s/^SUPABASE_ANON_KEY=.*/SUPABASE_ANON_KEY=$ANON_KEY/" "$env_file"

  # Prompt for Requesty key
  echo ""
  read -rp "$(echo -e "${CYAN}?${NC} Your Requesty API Key (press Enter to skip): ")" REQUESTY_KEY
  if [[ -n "$REQUESTY_KEY" ]]; then
    read -rp "$(echo -e "${CYAN}?${NC} Requesty base URL [https://router.requesty.ai/v1]: ")" REQUESTY_BASE
    REQUESTY_BASE=${REQUESTY_BASE:-https://router.requesty.ai/v1}
    read -rp "$(echo -e "${CYAN}?${NC} Requesty model name [tensorx/deepseek-v4-flash]: ")" REQUESTY_MODEL
    REQUESTY_MODEL=${REQUESTY_MODEL:-tensorx/deepseek-v4-flash}
  fi

  ok "App .env configured"
}

# ──────────────────────────────────────────────
# 7. Build PWA
# ──────────────────────────────────────────────
build_pwa() {
  info "Installing npm dependencies..."
  cd "$PROJECT_DIR/web"
  npm install
  info "Building PWA..."
  npm run build
  cd "$PROJECT_DIR"
  ok "PWA built → $PROJECT_DIR/web/dist"
}

# ──────────────────────────────────────────────
# 8. Deploy Edge Function
# ──────────────────────────────────────────────
deploy_edge_function() {
  if [[ -z "${REQUESTY_KEY:-}" ]]; then
    info "No Requesty key provided — skipping Edge Function deployment"
    return
  fi

  info "Installing Supabase CLI..."
  if ! command -v supabase &>/dev/null; then
    npm install -g supabase
  fi

  cd "$PROJECT_DIR/web"
  info "Linking to local Supabase..."
  supabase link --project-ref local \
    --project-url "http://$SERVER_IP:8000" 2>/dev/null || true

  supabase secrets set REQUESTY_API_KEY="$REQUESTY_KEY"
  supabase secrets set REQUESTY_BASE_URL="$REQUESTY_BASE"
  supabase secrets set REQUESTY_MODEL="$REQUESTY_MODEL"

  info "Deploying ai-score Edge Function..."
  supabase functions deploy ai-score
  cd "$PROJECT_DIR"
  ok "Edge Function deployed"
}

# ──────────────────────────────────────────────
# 9. Nginx reverse proxy
# ──────────────────────────────────────────────
setup_nginx() {
  local nginx_conf="/etc/nginx/sites-available/logpress"

  if $USE_DOMAIN; then
    info "Setting up nginx for domain: $DOMAIN"
    cat | sudo tee "$nginx_conf" > /dev/null <<NGINX
server {
    listen 80;
    server_name $DOMAIN;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN;

    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;

    root $PROJECT_DIR/web/dist;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /supabase/ {
        rewrite ^/supabase/(.*) /\$1 break;
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
    }
}
NGINX
  else
    info "Setting up nginx for direct IP access..."
    cat | sudo tee "$nginx_conf" > /dev/null <<NGINX
server {
    listen 80;
    server_name _;

    root $PROJECT_DIR/web/dist;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /supabase/ {
        rewrite ^/supabase/(.*) /\$1 break;
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
    }
}
NGINX
  fi

  sudo ln -sf "$nginx_conf" /etc/nginx/sites-enabled/
  sudo nginx -t && sudo systemctl reload nginx
  ok "Nginx configured"
}

# ──────────────────────────────────────────────
# 10. SSL (optional)
# ──────────────────────────────────────────────
setup_ssl() {
  if ! $USE_DOMAIN; then
    info "No domain — skipping SSL"
    return
  fi

  echo ""
  read -rp "$(echo -e "${CYAN}?${NC} Set up SSL with Let's Encrypt now? [Y/n]: ")" DO_SSL
  DO_SSL=${DO_SSL:-Y}
  if [[ "$DO_SSL" =~ ^[Yy]$ ]]; then
    sudo certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m "admin@$DOMAIN" || \
    sudo certbot --nginx -d "$DOMAIN"
    ok "SSL enabled"
  fi
}

# ──────────────────────────────────────────────
# Main
# ──────────────────────────────────────────────
main() {
  echo ""
  echo -e "${CYAN}══════════════════════════════════════════${NC}"
  echo -e "${CYAN}  LogPress — Full Stack Installer${NC}"
  echo -e "${CYAN}══════════════════════════════════════════${NC}"
  echo ""

  if [[ $EUID -eq 0 ]]; then
    err "Do NOT run as root. The script uses sudo where needed."
    exit 1
  fi

  SERVER_IP=$(hostname -I | awk '{print $1}')
  echo -e "  Detected IP: ${YELLOW}$SERVER_IP${NC}"
  echo ""
  read -rp "$(echo -e "${CYAN}?${NC} Do you have a domain name? (e.g. logpress.me) [y/N]: ")" HAS_DOMAIN
  if [[ "$HAS_DOMAIN" =~ ^[Yy]$ ]]; then
    read -rp "$(echo -e "${CYAN}?${NC} Enter your domain: ")" DOMAIN
    USE_DOMAIN=true
    echo ""
    warn "Make sure DNS A-record for $DOMAIN points to $SERVER_IP before continuing!"
    read -rp "Press Enter to continue..."
  fi

  echo ""
  info "Step 1/10 — Installing system dependencies..."
  install_system_deps

  echo ""
  info "Step 2/10 — Setting up repositories..."
  setup_repos

  echo ""
  info "Step 3/10 — Generating secure keys..."
  generate_keys

  echo ""
  info "Step 4/10 — Configuring Supabase..."
  setup_supabase_env

  echo ""
  info "Step 5/10 — Starting Supabase..."
  start_supabase

  echo ""
  info "Step 6/10 — Configuring app .env..."
  setup_app_env

  echo ""
  info "Step 7/10 — Building PWA..."
  build_pwa

  echo ""
  info "Step 8/10 — Deploying AI Edge Function..."
  deploy_edge_function

  echo ""
  info "Step 9/10 — Setting up Nginx..."
  setup_nginx

  echo ""
  info "Step 10/10 — SSL..."
  setup_ssl

  echo ""
  echo -e "${GREEN}══════════════════════════════════════════${NC}"
  echo -e "${GREEN}  Installation complete!${NC}"
  echo -e "${GREEN}══════════════════════════════════════════${NC}"
  echo ""
  echo -e "  ${YELLOW}PWA:${NC}  http://$SERVER_IP"
  if $USE_DOMAIN; then
    echo -e "           https://$DOMAIN"
  fi
  echo -e "  ${YELLOW}Studio:${NC} http://$SERVER_IP:3000 (password: your ANON_KEY)"
  echo ""
  echo -e "  ${YELLOW}Next steps:${NC}"
  echo -e "  1. Log into Supabase Studio → SQL Editor"
  echo -e "     → Run the SQL from ${CYAN}migrations/analytics_events.sql${NC}"
  echo -e "  2. If using a domain, update .env:"
  echo -e "     VITE_SUPABASE_URL=https://$DOMAIN/supabase"
  echo -e "     Then rebuild: cd web && npm run build"
  echo ""
  warn "Reboot recommended if Docker group was just added (newgrp docker)"
}
main
