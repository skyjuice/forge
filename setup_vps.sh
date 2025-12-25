#!/bin/bash
set -e

echo "🚀 Starting RackNerd VPS Setup..."

# 1. Update System
echo "📦 Updating system packages..."
apt-get update && apt-get upgrade -y

# 2. Install Essentials
echo "🛠️ Installing essential tools..."
apt-get install -y curl wget git sudo

# 3. Install Coolify
echo "💜 Installing Coolify..."
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash

echo "✅ Setup Complete!"
echo "👉 You can now access Coolify at: http://$(curl -s ifconfig.me):8000"
