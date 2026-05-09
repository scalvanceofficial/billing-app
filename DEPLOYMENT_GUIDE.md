# Deployment Guide: AWS EC2 (Ubuntu) with Docker & HTTPS

This guide will walk you through deploying the Billing App on an AWS EC2 Ubuntu instance using Docker Compose and a self-signed HTTPS certificate.

## 1. AWS EC2 Setup

1.  **Launch Instance**: Use `Ubuntu Server 22.04 LTS`.
2.  **Instance Type**: `t3.medium` is recommended (minimum 4GB RAM for building Next.js).
3.  **Security Group**: Ensure the following ports are open:
    - `22` (SSH)
    - `80` (HTTP)
    - `443` (HTTPS)

## 2. Server Preparation

SSH into your EC2 instance:
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

Update and install dependencies:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y openssl git curl
```

## 3. Install Docker & Docker Compose

Run the official Docker installation script:
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker
```

Install Docker Compose:
```bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

## 4. Clone and Configure Application

```bash
git clone https://github.com/scalvanceofficial/billing-app.git
cd billing-app
```

Create a production `.env` file:
```bash
cp .env.example .env
nano .env
```
*Make sure to change `AUTH_SECRET` and set your `DATABASE_URL` if not using the internal Docker DB.*

## 5. Generate Self-Signed Certificate

Create the SSL directory and generate the certificates:
```bash
mkdir -p nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/server.key \
  -out nginx/ssl/server.crt \
  -subj "/C=IN/ST=Maharashtra/L=Pune/O=BillingApp/OU=IT/CN=your-ec2-ip-or-domain"
```

## 6. Deployment

Build and start the containers in detached mode:
```bash
docker-compose up -d --build
```

### Important Notes:
- **First Run**: The `entrypoint.sh` will automatically run `prisma db push` and `seed.js`.
- **HTTPS**: Since it's a self-signed certificate, your browser will show a warning. Click "Advanced" -> "Proceed" to access the app.
- **Logs**: To view logs, run `docker-compose logs -f`.

## 7. Maintenance

- **Update App**:
  ```bash
  git pull
  docker-compose up -d --build
  ```
- **Stop App**: `docker-compose down`
- **Restart App**: `docker-compose restart`

---
**Powered by Antigravity AI**
