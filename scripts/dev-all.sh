#!/usr/bin/env bash
set -euo pipefail

# 프론트(-BR-POS-App-UX-PoC) + 백(dunkin-pos-ai) 동시 기동 스크립트.
# - PoC UX 흐름을 유지하면서 API-first로 점진 전환하기 위한 개발 편의용.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DUNKIN_BACKEND_DIR="${DUNKIN_BACKEND_DIR:-/home/ghyun/dunkin-pos-ai}"
PYTHON_BIN="${PYTHON_BIN:-python3}"

FRONT_PORT="${FRONT_PORT:-3001}"
BACK_PORT="${BACK_PORT:-8000}"

echo "[dev-all] frontend: http://localhost:${FRONT_PORT}"
echo "[dev-all] backend:   http://localhost:${BACK_PORT} (FastAPI /docs)"
echo "[dev-all] backend dir: ${DUNKIN_BACKEND_DIR}"
echo "[dev-all] python: ${PYTHON_BIN}"

if ! command -v "${PYTHON_BIN}" >/dev/null 2>&1; then
  echo "[dev-all] ERROR: ${PYTHON_BIN} not found. (예: sudo apt-get install -y python3 python3-venv)" >&2
  exit 1
fi

port_in_use() {
  local port="$1"
  if command -v ss >/dev/null 2>&1; then
    ss -ltn 2>/dev/null | awk '{print $4}' | grep -qE "(^|:)$port$"
    return $?
  fi
  # ss가 없으면 /dev/tcp 로 체크한다 (bash 기능).
  # 연결이 되면 "사용 중"으로 간주.
  if command -v timeout >/dev/null 2>&1; then
    timeout 0.2 bash -c "echo > /dev/tcp/127.0.0.1/${port}" >/dev/null 2>&1 && return 0
    return 1
  fi
  # 최후: 체크 불가 시 "미사용"으로 취급(Next가 중복 여부를 최종 방어).
  return 1
}

pick_free_port() {
  local start="$1"
  local max_tries="${2:-20}"
  local p="${start}"
  local i=0
  while [[ $i -lt $max_tries ]]; do
    if ! port_in_use "${p}"; then
      echo "${p}"
      return 0
    fi
    p=$((p + 1))
    i=$((i + 1))
  done
  return 1
}

if port_in_use "${BACK_PORT}"; then
  echo "[dev-all] ERROR: backend port ${BACK_PORT} already in use. (다른 포트로: BACK_PORT=8001 npm run dev:all)" >&2
  exit 1
fi

cleanup() {
  if [[ -n "${BACK_PID:-}" ]] && kill -0 "${BACK_PID}" 2>/dev/null; then
    kill "${BACK_PID}" 2>/dev/null || true
  fi
}
trap cleanup EXIT

FRONT_LOCK="${ROOT_DIR}/.next/dev/lock"
FRONT_ALREADY_RUNNING="0"
LOCK_PID=""

if [[ -f "${FRONT_LOCK}" ]]; then
  # lock 예시: {"pid":70739,"port":3001,...}
  LOCK_PID="$(python3 - "${FRONT_LOCK}" <<'PY' 2>/dev/null || true
import json,sys
try:
  d=json.load(open(sys.argv[1],'r',encoding='utf-8'))
  print(d.get('pid',''))
except Exception:
  pass
PY
)"
  if [[ -n "${LOCK_PID}" ]] && kill -0 "${LOCK_PID}" 2>/dev/null; then
    FRONT_ALREADY_RUNNING="1"
    LOCK_URL="$(python3 - "${FRONT_LOCK}" <<'PY' 2>/dev/null || true
import json,sys
try:
  d=json.load(open(sys.argv[1],'r',encoding='utf-8'))
  print(d.get('appUrl',''))
except Exception:
  pass
PY
)"
    echo "[dev-all] detected existing Next dev server (pid=${LOCK_PID}) ${LOCK_URL:-}"
  fi
fi

if [[ "${FRONT_ALREADY_RUNNING}" == "1" ]]; then
  # Next.js는 동일 디렉토리에서 dev 서버를 "동시에 2개" 띄우는 것을 막는다(포트가 달라도).
  # 따라서 "프론트도 같이"를 만족하려면 기존 dev 서버를 종료해야 한다.
  if [[ "${DEV_ALL_KILL_EXISTING:-0}" == "1" ]]; then
    echo "[dev-all] stopping existing Next dev server pid=${LOCK_PID} (DEV_ALL_KILL_EXISTING=1)"
    kill "${LOCK_PID}" 2>/dev/null || true
    # lock 정리는 Next가 하며, 잠깐의 텀이 필요할 수 있다.
    sleep 0.3
  else
    echo "[dev-all] ERROR: Next dev server already running (pid=${LOCK_PID})." >&2
    echo "[dev-all] - 종료 후 재실행: kill ${LOCK_PID} && npm run dev:all" >&2
    echo "[dev-all] - 또는 자동 종료 옵션: DEV_ALL_KILL_EXISTING=1 npm run dev:all" >&2
    exit 1
  fi

  (
    cd "${DUNKIN_BACKEND_DIR}"
    export DB_BACKEND="${DB_BACKEND:-sqlite}"
    "${PYTHON_BIN}" -m uvicorn services.ai.main:app --reload --host 0.0.0.0 --port "${BACK_PORT}"
  ) &
  BACK_PID=$!

  cd "${ROOT_DIR}"
  npm run dev -- -p "${FRONT_PORT}"
else
  (
    cd "${DUNKIN_BACKEND_DIR}"
    export DB_BACKEND="${DB_BACKEND:-sqlite}"
    "${PYTHON_BIN}" -m uvicorn services.ai.main:app --reload --host 0.0.0.0 --port "${BACK_PORT}"
  ) &
  BACK_PID=$!

  cd "${ROOT_DIR}"
  npm run dev -- -p "${FRONT_PORT}"
fi

