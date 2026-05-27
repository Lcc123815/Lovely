#!/usr/bin/env bash
set -e

APP_NAME="campus-cats-backend"
APP_DIR="$(cd "$(dirname "$0")" && pwd)"
VENV_PYTHON="$APP_DIR/venv/bin/python"
LOG_DIR="$APP_DIR/logs"
PID_FILE="$APP_DIR/$APP_NAME.pid"
HOST="${HOST:-0.0.0.0}"
PORT="${PORT:-8001}"

export DB_HOST="${DB_HOST:-127.0.0.1}"
export DB_PORT="${DB_PORT:-3306}"
export DB_USER="${DB_USER:-root}"
export DB_PASSWORD="${DB_PASSWORD:-L123456}"
export DB_NAME="${DB_NAME:-campus_cats}"
export JWT_SECRET="${JWT_SECRET:-campus-cats-secret}"
export PUBLIC_BASE_URL="${PUBLIC_BASE_URL:-http://127.0.0.1:$PORT}"

mkdir -p "$LOG_DIR"

if [ ! -x "$VENV_PYTHON" ]; then
  echo "未找到虚拟环境 Python：$VENV_PYTHON"
  echo "请先执行：python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt"
  exit 1
fi

is_running() {
  [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null
}

start() {
  if is_running; then
    echo "$APP_NAME 已在运行，PID=$(cat "$PID_FILE")"
    exit 0
  fi
  cd "$APP_DIR"
  nohup "$VENV_PYTHON" -m uvicorn main:app --host "$HOST" --port "$PORT" > "$LOG_DIR/app.log" 2>&1 &
  echo $! > "$PID_FILE"
  echo "$APP_NAME 启动成功，PID=$(cat "$PID_FILE")，日志：$LOG_DIR/app.log"
}

stop() {
  if ! is_running; then
    echo "$APP_NAME 未运行"
    rm -f "$PID_FILE"
    exit 0
  fi
  kill "$(cat "$PID_FILE")"
  rm -f "$PID_FILE"
  echo "$APP_NAME 已停止"
}

status() {
  if is_running; then
    echo "$APP_NAME 正在运行，PID=$(cat "$PID_FILE")"
  else
    echo "$APP_NAME 未运行"
  fi
}

case "${1:-start}" in
  start)
    start
    ;;
  stop)
    stop
    ;;
  restart)
    stop || true
    start
    ;;
  status)
    status
    ;;
  *)
    echo "用法：$0 {start|stop|restart|status}"
    exit 1
    ;;
esac
