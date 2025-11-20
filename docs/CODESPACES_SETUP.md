# GitHub Codespaces Setup Guide

## Port Forwarding

In GitHub Codespaces, ports need to be explicitly forwarded. The `.devcontainer/devcontainer.json` file will automatically forward the required ports when the Codespace is created.

### Required Ports

- **3000** - Frontend (Next.js)
- **4000** - Auth Service (FastAPI)
- **5000** - Backend Service (Flask)
- **5432** - PostgreSQL (optional, for database access)

## Manual Port Forwarding

If ports aren't automatically forwarded, you can manually forward them:

1. **Via VS Code UI:**
   - Open the "Ports" tab in VS Code
   - Click "Forward a Port"
   - Enter port numbers: 4000, 5000
   - Set visibility to "Public" if needed

2. **Via Command Palette:**
   - Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
   - Type "Forward a Port"
   - Enter the port number

3. **Via Terminal:**
   ```bash
   # Check forwarded ports
   gh codespace ports list
   
   # Forward a port
   gh codespace ports forward 4000:4000
   gh codespace ports forward 5000:5000
   ```

## Verifying Port Forwarding

After forwarding ports, you should see URLs like:
- `https://[codespace-name]-3000.app.github.dev` (Frontend)
- `https://[codespace-name]-4000.app.github.dev` (Auth Service)
- `https://[codespace-name]-5000.app.github.dev` (Backend Service)

## Troubleshooting 403 Forbidden

If you get a 403 Forbidden error when accessing services:

1. **Check if ports are forwarded:**
   ```bash
   docker-compose ps
   # Should show all services running
   ```

2. **Verify services are accessible:**
   ```bash
   # Test auth service (from inside the container)
   curl http://localhost:4000/health
   
   # Test backend service
   curl http://localhost:5000/health
   ```

3. **Check port forwarding status:**
   - Open VS Code "Ports" tab
   - Verify ports 4000 and 5000 are listed and forwarded

4. **Restart services:**
   ```bash
   make down
   make dev
   ```

5. **If still having issues, manually forward ports:**
   - Use the VS Code Ports tab to forward ports 4000 and 5000
   - Make sure they're set to "Public" visibility

## Environment Variables

The application automatically detects Codespaces URLs and constructs service URLs accordingly. No manual configuration needed!

