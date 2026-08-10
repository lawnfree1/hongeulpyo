import express from 'express';
import cookieParser from 'cookie-parser';
import { ensureSchema } from './db.js';
import adminRoutes from './routes/admin.js';
import publicRoutes from './routes/public.js';

export function createApp() {
  const app = express();

  // Vercel / 리버스 프록시 뒤에서 실제 클라이언트 IP를 얻기 위해
  app.set('trust proxy', true);
  app.disable('x-powered-by');

  app.use(express.json({ limit: '32kb' }));
  app.use(cookieParser());

  app.use('/api', (req, res, next) => {
    req.clientIp = req.ip || req.socket?.remoteAddress || 'unknown';
    res.setHeader('Cache-Control', 'no-store');
    next();
  });

  // 첫 요청(콜드스타트) 때 테이블과 기본 설정을 준비한다.
  app.use('/api', async (req, res, next) => {
    try {
      await ensureSchema();
      next();
    } catch (err) {
      console.error('DB 초기화 실패:', err);
      res.status(503).json({ error: '데이터베이스에 연결할 수 없습니다.' });
    }
  });

  app.get('/api/health', (req, res) => res.json({ ok: true }));

  app.use('/api', publicRoutes);
  app.use('/api/admin', adminRoutes);

  app.use('/api', (req, res) => res.status(404).json({ error: '없는 경로입니다.' }));

  // eslint-disable-next-line no-unused-vars -- express는 인자 4개로 오류 핸들러를 구분한다
  app.use((err, req, res, next) => {
    console.error('서버 오류:', err);
    res.status(500).json({ error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.' });
  });

  return app;
}
