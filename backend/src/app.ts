import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/env';
import { authRouter } from './modules/auth/auth.routes';
import { profileRouter } from './modules/profile/profile.routes';
import { counsellorRouter } from './modules/counsellor/counsellor.routes';
import { adminRouter } from './modules/admin/admin.routes';
import { preferencesRouter } from './modules/preferences/preferences.routes';
import { educationRouter } from './modules/education/education.routes';
import { entranceRouter } from './modules/entrance/entrance.routes';
import { personalRouter } from './modules/personal/personal.routes';
import { collegesRouter } from './modules/colleges/colleges.routes';
import { recommendationsRouter } from './modules/recommendations/recommendations.routes';
import { scholarshipsRouter } from './modules/scholarships/scholarships.routes';
import { feesRouter } from './modules/fees/fees.routes';
import { assessmentsRouter } from './modules/assessments/assessments.routes';
import { appointmentsRouter } from './modules/appointments/appointments.routes';
import { errorHandler, notFoundHandler } from './shared/middleware/error.middleware';
import { ApiResponse } from './shared/utils/api-response';

export const createApp = (): Application => {
  const app = express();

  // Security and request parsing
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(
    cors({
      origin: config.cors.origin,
      credentials: true,
    })
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // Root platform status check & API gateway dashboard
  app.get('/', (req: Request, res: Response) => {
    const acceptsHtml = req.accepts('html');
    if (acceptsHtml) {
      return res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Superconsciousness — Backend API Server</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #0B1535;
      color: #F8FAFC;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem 1.5rem;
    }
    .card {
      background: #121F47;
      border: 1px solid rgba(221, 214, 254, 0.2);
      border-radius: 20px;
      padding: 2.75rem 2.5rem;
      max-width: 680px;
      width: 100%;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .brand-icon {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      background: linear-gradient(135deg, #4338CA 0%, #6D28D9 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.3rem;
    }
    .brand-title {
      font-size: 1.35rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: #FFFFFF;
    }
    .brand-title span { color: #C7D2FE; }
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.35rem 0.85rem;
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.35);
      color: #34D399;
      border-radius: 9999px;
      font-size: 0.8rem;
      font-weight: 700;
      letter-spacing: 0.05em;
    }
    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10B981;
      box-shadow: 0 0 10px #10B981;
    }
    h1 {
      font-size: 1.75rem;
      font-weight: 800;
      margin-bottom: 0.75rem;
      color: #FFFFFF;
    }
    p {
      color: #94A3B8;
      font-size: 0.975rem;
      line-height: 1.6;
      margin-bottom: 2rem;
    }
    .cta-banner {
      background: linear-gradient(135deg, rgba(67, 56, 202, 0.25) 0%, rgba(109, 40, 217, 0.25) 100%);
      border: 1px solid rgba(199, 210, 254, 0.3);
      border-radius: 14px;
      padding: 1.25rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }
    .cta-text {
      display: flex;
      flex-direction: column;
    }
    .cta-title {
      font-size: 0.95rem;
      font-weight: 700;
      color: #FFFFFF;
    }
    .cta-sub {
      font-size: 0.825rem;
      color: #C7D2FE;
      margin-top: 2px;
    }
    .btn-launch {
      background: #FFFFFF;
      color: #0B1535;
      text-decoration: none;
      font-weight: 700;
      font-size: 0.925rem;
      padding: 0.65rem 1.4rem;
      border-radius: 9999px;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
    }
    .btn-launch:hover {
      background: #F3F0FF;
      color: #6D28D9;
      transform: translateY(-1px);
    }
    .modules-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.85rem;
      margin-bottom: 2rem;
    }
    .module-item {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 10px;
      padding: 0.85rem;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .module-name {
      font-size: 0.85rem;
      font-weight: 700;
      color: #F8FAFC;
    }
    .module-status {
      font-size: 0.725rem;
      color: #34D399;
      font-weight: 600;
    }
    .links-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding-top: 1.25rem;
      font-size: 0.85rem;
      color: #64748B;
      flex-wrap: wrap;
      gap: 0.75rem;
    }
    .links-row a {
      color: #818CF8;
      text-decoration: none;
      font-weight: 600;
    }
    .links-row a:hover {
      color: #C7D2FE;
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="brand">
        <div class="brand-icon">⚡</div>
        <div class="brand-title">SUPER<span>CONSCIOUSNESS</span></div>
      </div>
      <div class="status-badge">
        <span class="status-dot"></span>
        <span>API ONLINE • PORT 5000</span>
      </div>
    </div>

    <h1>Backend REST API Server</h1>
    <p>
      The Superconsciousness backend service is running and healthy. All authentication, profile intake,
      academic preferences, and education modules are active. To access the student and counsellor user interface, click below.
    </p>

    <div class="cta-banner">
      <div class="cta-text">
        <span class="cta-title">Looking for the Superconsciousness Website?</span>
        <span class="cta-sub">Frontend application is running on port 3000</span>
      </div>
      <a href="http://localhost:3000" class="btn-launch">
        Open Website (localhost:3000) &rarr;
      </a>
    </div>

    <div class="modules-grid">
      <div class="module-item">
        <span class="module-name">Module 1: Intake</span>
        <span class="module-status">● OPERATIONAL</span>
      </div>
      <div class="module-item">
        <span class="module-name">Module 2: Preferences</span>
        <span class="module-status">● OPERATIONAL</span>
      </div>
      <div class="module-item">
        <span class="module-name">Module 3: Education</span>
        <span class="module-status">● OPERATIONAL</span>
      </div>
      <div class="module-item">
        <span class="module-name">Module 4: Entrance Exams</span>
        <span class="module-status">● OPERATIONAL</span>
      </div>
      <div class="module-item">
        <span class="module-name">Module 5: Personal Info</span>
        <span class="module-status">● OPERATIONAL</span>
      </div>
      <div class="module-item">
        <span class="module-name">Module 6: College Discovery</span>
        <span class="module-status">● OPERATIONAL</span>
      </div>
    </div>

    <div class="links-row">
      <span>API Health Check: <a href="/api/health">/api/health</a></span>
      <span>Frontend Website: <a href="http://localhost:3000">http://localhost:3000</a></span>
    </div>
  </div>
</body>
</html>`);
    }

    return ApiResponse.success(res, {
      platform: 'Superconsciousness Backend API',
      status: 'OPERATIONAL',
      environment: config.env,
      frontendUrl: 'http://localhost:3000',
      healthCheck: '/api/health',
      modules: {
        module1: 'Account and Profile Intake (OPERATIONAL)',
        module2: 'Preferences (OPERATIONAL)',
        module3: 'Education Details (OPERATIONAL)',
        module4: 'Entrance Exams (OPERATIONAL)',
        module5: 'Personal Information (OPERATIONAL)',
        module6: 'College and Course Discovery (OPERATIONAL)',
      },
    }, 'Superconsciousness Backend API is operational');
  });

  // Health endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    ApiResponse.success(
      res,
      {
        platform: 'Superconsciousness API',
        environment: config.env,
        status: 'OPERATIONAL',
        module1: {
          name: 'Account and Profile Intake',
          status: 'FOUNDATION_READY',
        },
        module2: {
          name: 'Preferences',
          status: 'OPERATIONAL',
        },
        module3: {
          name: 'Education Details',
          status: 'OPERATIONAL',
        },
        module4: {
          name: 'Entrance Exams',
          status: 'OPERATIONAL',
        },
        module5: {
          name: 'Personal Information',
          status: 'OPERATIONAL',
        },
        module6: {
          name: 'College and Course Discovery',
          status: 'OPERATIONAL',
        },
      },
      'Superconsciousness API is healthy'
    );
  });

  // Mount domain modules
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/profile', profileRouter);
  app.use('/api/v1/preferences', preferencesRouter);
  app.use('/api/v1/education', educationRouter);
  app.use('/api/v1/exams', entranceRouter);
  app.use('/api/v1/personal', personalRouter);
  app.use('/api/v1/colleges', collegesRouter);
  app.use('/api/v1/recommendations', recommendationsRouter);
  app.use('/api/v1/scholarships', scholarshipsRouter);
  app.use('/api/v1/fees', feesRouter);
  app.use('/api/v1/assessments', assessmentsRouter);
  app.use('/api/v1/appointments', appointmentsRouter);
  app.use('/api/v1/counsellor', counsellorRouter);
  app.use('/api/v1/admin', adminRouter);

  // Catch-all handlers
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
