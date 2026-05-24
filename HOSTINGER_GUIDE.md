# Hostinger Node.js Deployment Guide (Unlimited Plan / ₹249 Monthly)

This guide walks you through deploying the Masala Billing Node.js application (with MySQL) on Hostinger's standard Node.js hosting plan or any similar VPS/Panel based hosting.

## Prerequisites
- A Hostinger Node.js hosting plan (or VPS) with cPanel, hPanel, or SSH access.
- A domain or subdomain pointing to your Hostinger server.

## Step 1: Set Up MySQL Database

1. Log into your **Hostinger hPanel**.
2. Go to **Databases -> MySQL Databases**.
3. Create a new MySQL database:
   - **Database Name**: e.g., `u123456789_masaladb`
   - **MySQL Username**: e.g., `u123456789_masalauser`
   - **Password**: Create a strong password.
4. Keep these credentials handy. You will need them for the `.env` file.

## Step 2: Upload the Project Files

1. Go to **File Manager** in hPanel.
2. Navigate to your domain's public folder (usually `public_html` or a specific app directory if you're using Hostinger's Node.js auto-installer).
3. Zip your project folder locally (exclude `node_modules`, `.next`, and `.git`) and upload it via File Manager.
4. Extract the zip file in the directory.
5. Ensure the `public/uploads` directory exists. If it doesn't, create it and give it write permissions (CHMOD `755` or `777` depending on the server).

## Step 3: Configure Environment Variables

1. In the root of your project directory on the server, edit the `.env` file.
2. Update the `DATABASE_URL` with your Hostinger MySQL details:
   ```env
   DATABASE_URL="mysql://u123456789_masalauser:YOUR_PASSWORD@localhost:3306/u123456789_masaladb"
   ```
   *(Note: Hostinger usually uses `localhost` for MySQL if the DB is on the same server, but check your DB connection details in hPanel).*

3. Update your `NEXTAUTH_URL` to your actual domain name:
   ```env
   NEXTAUTH_URL="https://yourdomain.com"
   ```

## Step 4: Install Dependencies and Build

1. Open **SSH/Terminal** from your Hostinger panel or connect via an SSH client (like PuTTY).
2. Navigate to your project directory:
   ```bash
   cd public_html  # Or your specific app directory
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Push the Prisma Schema to the new MySQL Database. This creates the tables:
   ```bash
   npx prisma db push
   ```
   *Optional: Run `node prisma/seed.js` if you have seed data you want to import.*
5. Build the Next.js application:
   ```bash
   npm run build
   ```

## Step 5: Start the App with PM2

Hostinger Node.js plans usually use `PM2` or a custom Application Manager.

**If using Terminal/SSH with PM2:**
1. Start the app:
   ```bash
   pm2 start npm --name "masala-billing" -- run start
   ```
2. Save the PM2 process so it restarts on server reboot:
   ```bash
   pm2 save
   ```

**If using Hostinger's Node.js Application Manager:**
1. Go to **Node.js App** in hPanel.
2. Select your application directory.
3. Set the Startup command to: `npm run start` or point it to `node_modules/next/dist/bin/next start`.
4. Click **Start** or **Restart**.

## Step 6: Verify Settings & Uploads
1. Go to `https://yourdomain.com/login` and log in (default: `admin@masala.com` / `Admin@123`).
2. Go to **Settings** and upload your Shop Logo and fill in the details (Shop Name, GST, FSSAI).
3. The uploaded logo will be securely stored in the `public/uploads` folder on your Hostinger server and will persist across app restarts.
4. Verify the invoices to ensure the Logo, GST, and FSSAI are reflecting correctly in both PDF and Thermal printing modes.
