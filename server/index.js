import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { createApp } from './app.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '..', 'dist');

const app = createApp();

// 빌드 결과물이 있으면 같이 서빙한다 (npm start — Vercel 외 배포/로컬 확인용).
// 개발 중에는 Vite가 프론트를 맡고 이 서버는 /api만 처리한다.
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  // Express 5에서는 '*' 문자열 경로를 쓸 수 없어 미들웨어로 처리한다.
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

const port = Number(process.env.PORT || 3001);
const server = app.listen(port);

// 에러 핸들러가 없으면 포트 충돌 시 아무 설명 없이 프로세스가 종료된다.
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(
      `\n포트 ${port}이(가) 이미 사용 중입니다.\n` +
        `  · 무엇이 쓰고 있는지 확인: lsof -nP -iTCP:${port} -sTCP:LISTEN\n` +
        `  · 다른 포트로 실행: .env의 PORT 값을 바꾸거나 PORT=3002 npm start\n`
    );
  } else {
    console.error('서버를 시작하지 못했습니다:', err);
  }
  process.exit(1);
});

server.on('listening', () => {
  console.log(`API 서버 실행 중 → http://localhost:${port}`);
});
