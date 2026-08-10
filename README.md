# 법무사 홍을표 사무소 랜딩 페이지

Figma 디자인 기반 원페이지 랜딩 + 상담 신청 접수(MySQL 저장) + 솔라피 문자 알림 + 관리자 페이지.

## 구성

```
src/                      프론트엔드 (React + TypeScript + Tailwind + Vite)
├── App.tsx                 랜딩 페이지
├── main.tsx                / → App, /admin → AdminPage
├── lib/api.ts              서버 API 호출
├── components/
│   ├── QuickConsultForm    상단·중단 가로형 상담 신청 바
│   ├── DetailConsultForm   하단 카드형 상담 신청 폼
│   └── admin/              관리자 화면 (내역·알림설정·비밀번호)
└── pages/                  AdminLogin, AdminPage

server/                   백엔드 (Express)
├── app.js                  Express 앱 구성 (로컬·Vercel 공용)
├── index.js                로컬 실행 진입점 (dist가 있으면 정적 파일도 서빙)
├── db.js                   MySQL 풀 · 스키마 생성 · 설정값
├── auth.js                 비밀번호 해싱(scrypt) · 세션 쿠키 · 로그인 제한
├── sms.js                  솔라피 발송
├── validation.js           전화번호·상태값 검증, KST 시각 포맷
└── routes/
    ├── public.js           POST /api/consultations
    └── admin.js            로그인·내역·설정·비밀번호 API

api/index.js              Vercel 서버리스 함수 진입점
```

테이블(`consultations`, `settings`, `login_attempts`)은 서버가 처음 뜰 때 자동으로 생성됩니다.
별도 마이그레이션 명령이 필요 없습니다.

## 로컬 실행

1. MySQL에 데이터베이스를 만듭니다.

```bash
mysql -u root -e "CREATE DATABASE hongeulpyo CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;"
```

2. `.env.example`을 복사해 `.env`를 채웁니다.

```bash
cp .env.example .env
```

3. 프론트(3000)와 API(3001)를 같이 띄웁니다.

```bash
npm run dev
```

- 랜딩 페이지: http://localhost:3000
- 관리자 페이지: http://localhost:3000/admin

## 환경변수

| 이름 | 설명 |
| --- | --- |
| `DATABASE_TYPE` | `mysql` 고정 |
| `DATABASE_HOST` / `DATABASE_PORT` | MySQL 주소·포트 |
| `DATABASE_USERNAME` / `DATABASE_PASSWORD` | 접속 계정 |
| `DATABASE_NAME` | 데이터베이스 이름 |
| `DATABASE_SSL` | 외부 관리형 MySQL이면 `true` (RDS는 mysql2 내장 CA로 검증) |
| `DATABASE_POOL_SIZE` | 커넥션 풀 크기 (서버리스 기본 4) |
| `SOLAPI_API_KEY` / `SOLAPI_API_SECRET` | 솔라피 API 키 |
| `SESSION_SECRET` | 관리자 세션 쿠키 서명 키. 비우면 DB에 자동 생성 |
| `PORT` | 로컬 API 포트 (Vercel에서는 미사용) |

## Vercel 배포

1. Vercel 프로젝트에 이 저장소를 연결합니다. 빌드 설정은 `vercel.json`에 들어 있어 그대로 두면 됩니다.
2. **Settings → Environment Variables**에 위 표의 값을 모두 등록합니다.
   `.env` 파일은 커밋되지 않으므로 반드시 대시보드에 따로 넣어야 합니다.
3. MySQL은 외부에서 접속 가능한 관리형 DB여야 합니다(AWS RDS 등).
   **Vercel 함수는 고정 IP가 없으므로** RDS 보안그룹 인바운드에서 3306 포트를 열어 두어야
   접속됩니다. 특정 IP만 허용해 두면 배포 후 DB 연결이 실패합니다.
   공용 인터넷 구간을 지나므로 `DATABASE_SSL=true`로 두어 암호화하세요.
4. 배포 후 `/admin`에서 초기 비밀번호로 로그인하고, **비밀번호를 먼저 변경**한 뒤
   **알림 설정**에서 발신번호와 수신번호를 등록합니다.

## 관리자 페이지 (`/admin`)

- **초기 비밀번호: `password@@`** — 첫 로그인 후 반드시 변경하세요.
  변경 전까지 상단에 경고 배너가 표시됩니다.
- **상담 신청 내역**: 상태별 집계, 성함·연락처 검색, 행을 누르면 메모·상태 변경,
  전화 걸기, 알림 문자 재발송, 삭제. CSV 내려받기 지원.
- **알림 설정**: 발신번호 1개와 수신번호 최대 10개를 등록합니다. 상담 신청이 들어오면
  등록된 번호로 신청 내용이 문자로 발송됩니다. `테스트 문자 발송`으로 설정을 확인할 수 있습니다
  (실제 발송되어 요금이 부과됩니다).
- **비밀번호 변경**: 8자 이상, 영문·숫자·특수문자 중 2종류 이상.
  변경하면 로그인된 모든 기기가 로그아웃됩니다.

### 발신번호 주의사항

솔라피는 **계정에 사전 등록된 발신번호**로만 발송할 수 있습니다.
솔라피 콘솔에서 발신번호 등록을 마친 뒤 관리자 페이지에 입력하세요.
수신번호는 휴대폰 번호만 가능합니다.

## 동작 메모

- 상담 신청은 **문자 발송이 실패해도 DB에는 항상 저장**됩니다. 발송 결과는 내역의 `문자` 열에
  `발송됨 / 실패 / 건너뜀`으로 남고, 실패한 건은 상세에서 재발송할 수 있습니다.
- 발신번호나 수신번호가 비어 있으면 저장만 하고 발송은 `건너뜀`으로 기록합니다.
- 시각은 DB에 UTC로 저장하고 화면에는 KST로 표시합니다.
- 같은 번호가 1분 내 다시 접수되면 중복으로 보고 저장하지 않습니다(더블 클릭·새로고침 방지).
- 로그인 실패가 15분 내 10회를 넘으면 해당 IP의 로그인을 일시 차단합니다.
