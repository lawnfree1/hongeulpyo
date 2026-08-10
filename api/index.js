// Vercel 서버리스 함수 진입점. /api/* 요청이 이 핸들러로 들어온다.
// 정적 파일(dist)은 Vercel이 CDN에서 직접 서빙하므로 여기서는 API만 다룬다.
import { createApp } from '../server/app.js';

export default createApp();
