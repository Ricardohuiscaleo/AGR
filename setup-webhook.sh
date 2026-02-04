#!/bin/bash

# Configurar webhook de GitHub para Easypanel

read -p "GitHub Token: " GITHUB_TOKEN
read -p "Easypanel Deployment URL: " EASYPANEL_URL

curl -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/Ricardohuiscaleo/AGR/hooks \
  -d "{
    \"config\": {
      \"url\": \"$EASYPANEL_URL\",
      \"content_type\": \"json\"
    },
    \"events\": [\"push\"],
    \"active\": true
  }"

echo "✅ Webhook configurado"
