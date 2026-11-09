#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
# Public pilot uses local data only until an isolated Firebase staging project exists.
VITE_LOCAL_ONLY=true VITE_AI_ENDPOINT= VITE_BASE_PATH="${VITE_BASE_PATH:-/}" npm run build
