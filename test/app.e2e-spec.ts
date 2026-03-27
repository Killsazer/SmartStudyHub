import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
const request = require('supertest');
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/shared/prisma/prisma.service';

jest.mock('bcrypt', () => ({
  compare: jest.fn().mockResolvedValue(true),
  genSalt: jest.fn().mockResolvedValue('salt'),
  hash: jest.fn().mockResolvedValue('hash'),
}));

describe('Smart Study Hub (e2e)', () => {
  let app: INestApplication;
  let prismaMock: any;
  let accessToken: string;
  let testSubjectId = 'subj-test';
  let testTaskId = 'task-test';

  beforeAll(async () => {
    prismaMock = {
      user: {
        findUnique: jest.fn(),
        upsert: jest.fn(),
      },
      subject: {
        findMany: jest.fn(),
        upsert: jest.fn(),
        create: jest.fn(),
      },
      task: {
        findUnique: jest.fn(),
        upsert: jest.fn(),
        findMany: jest.fn(),
      }
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Auth Flow', () => {
    it('/auth/register (POST) - creates user', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(null);
      prismaMock.user.upsert.mockResolvedValueOnce({});
      
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'e2e@kpi.ua', password: 'secure', firstName: 'Petro', lastName: 'Student' })
        .expect(201);
        
      expect(res.body).toHaveProperty('accessToken');
    });

    it('/auth/login (POST) - issues token', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce({
        id: 'u1', email: 'e2e@kpi.ua', password: 'hash', firstName: 'P', lastName: 'S'
      });

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'e2e@kpi.ua', password: 'secure' })
        .expect(201);
        
      expect(res.body).toHaveProperty('accessToken');
      accessToken = res.body.accessToken;
    });
  });

  describe('Protected Routes & Functional Flow', () => {
    it('/subjects (GET) without token returns 401 Unauthorized', () => {
      return request(app.getHttpServer())
        .get('/subjects')
        .expect(401);
    });

    it('/subjects (POST) Creates Subject with Valid Token', async () => {
      prismaMock.subject.upsert.mockResolvedValueOnce({});
      
      const res = await request(app.getHttpServer())
        .post('/subjects')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'E2E Architecture Subject', color: '#FFF' })
        .expect(201);
        
      expect(res.body.status).toBe('success');
      expect(res.body.data.id).toBeDefined();
      testSubjectId = res.body.data.id;
    });

    it('/tasks (POST) Creates Task for Subject', async () => {
      prismaMock.task.upsert.mockResolvedValueOnce({});
      
      const res = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Finish tests', priority: 'HIGH', subjectId: testSubjectId })
        .expect(201);
        
      expect(res.body.status).toBe('success');
      expect(res.body.data.id).toBeDefined();
      testTaskId = res.body.data.id;
    });
    
    it('/tasks/:id/status (PATCH) Updates Status to trigger Pattern observers', async () => {
      prismaMock.task.findUnique.mockResolvedValueOnce({
        id: testTaskId, title: 'Finish tests', status: 'TODO', priority: 'HIGH', userId: 'u1'
      });
      prismaMock.task.upsert.mockResolvedValueOnce({});
      
      const res = await request(app.getHttpServer())
        .patch(`/tasks/${testTaskId}/status`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ status: 'DONE' })
        .expect(200);
        
      expect(res.body.status).toBe('success');
      expect(res.body.message).toContain('DONE');
    });
  });
});
