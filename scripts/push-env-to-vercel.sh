#!/usr/bin/env bash
# .env의 값을 Vercel 프로젝트 환경변수로 등록한다.
#
# 사용 전 준비:
#   npx vercel login     # 배포할 계정으로 로그인
#   npx vercel link      # 프로젝트 연결(또는 새로 생성)
#
# 사용법:
#   bash scripts/push-env-to-vercel.sh              # production에 등록
#   bash scripts/push-env-to-vercel.sh preview      # preview에 등록
#
# 이미 같은 이름의 변수가 있으면 지우고 다시 넣는다.

set -euo pipefail

TARGET="${1:-production}"
ENV_FILE=".env"

# PORT는 Vercel이 직접 관리하므로 올리지 않는다.
KEYS=(
  DATABASE_TYPE
  DATABASE_HOST
  DATABASE_PORT
  DATABASE_USERNAME
  DATABASE_PASSWORD
  DATABASE_NAME
  DATABASE_SSL
  DATABASE_POOL_SIZE
  SOLAPI_API_KEY
  SOLAPI_API_SECRET
  SESSION_SECRET
)

if [ ! -f "$ENV_FILE" ]; then
  echo "$ENV_FILE 이 없습니다. 프로젝트 루트에서 실행하세요." >&2
  exit 1
fi

if [ ! -d ".vercel" ]; then
  echo "프로젝트가 연결되지 않았습니다. 먼저 'npx vercel link'를 실행하세요." >&2
  exit 1
fi

echo "대상 환경: $TARGET"
echo

for key in "${KEYS[@]}"; do
  # .env에서 값 추출 (첫 '=' 뒤 전체, 따옴표 제거)
  value="$(grep -E "^${key}=" "$ENV_FILE" | head -1 | cut -d= -f2- | sed 's/^"\(.*\)"$/\1/')"

  if [ -z "$value" ]; then
    echo "  건너뜀  $key (.env에 값 없음)"
    continue
  fi

  # 기존 값이 있으면 제거 (없으면 조용히 통과)
  npx --yes vercel@latest env rm "$key" "$TARGET" --yes >/dev/null 2>&1 || true

  printf '%s' "$value" | npx --yes vercel@latest env add "$key" "$TARGET" >/dev/null 2>&1
  echo "  등록됨  $key"
done

echo
echo "완료. 반영하려면 다시 배포하세요: npx vercel --prod"
