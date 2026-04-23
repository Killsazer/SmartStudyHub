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

const bcrypt = require('bcrypt');

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
      },
      note: {
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

  // Auth flow
  describe('Auth Flow', () => {
    it('✅ /auth/register (POST) — creates user and returns token', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(null);
      prismaMock.user.upsert.mockResolvedValueOnce({});
      
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'e2e@kpi.ua', password: 'secure', firstName: 'Petro', lastName: 'Student' })
        .expect(201);
        
      expect(res.body).toHaveProperty('accessToken');
    });

    it('❌ /auth/register (POST) — duplicate email returns 409 Conflict', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce({
        id: 'existing', email: 'e2e@kpi.ua', password: 'hash', firstName: 'P', lastName: 'S'
      });
      
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'e2e@kpi.ua', password: 'secure', firstName: 'Petro', lastName: 'Student' })
        .expect(409);
    });

    it('✅ /auth/login (POST) — valid credentials issue token', async () => {
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

    it('❌ /auth/login (POST) — wrong password returns 401', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce({
        id: 'u1', email: 'e2e@kpi.ua', password: 'hash', firstName: 'P', lastName: 'S'
      });
      bcrypt.compare.mockResolvedValueOnce(false);

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'e2e@kpi.ua', password: 'wrong' })
        .expect(401);
    });
  });

  // Protected routes — subjects

  describe('Subjects Flow', () => {
    it('❌ /subjects (GET) without token returns 401 Unauthorized', () => {
      return request(app.getHttpServer())
        .get('/subjects')
        .expect(401);
    });

    it('✅ /subjects (POST) creates Subject with Valid Token', async () => {
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
  });

  // Tasks flow

  describe('Tasks Flow', () => {
    it('✅ /tasks (POST) creates Task for Subject', async () => {
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
    
    it('✅ /tasks/:id/status (PATCH) triggers Command + Observer patterns', async () => {
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

    it('✅ /tasks?sort=priority (GET) returns sorted tasks via Strategy', async () => {
      prismaMock.task.findMany.mockResolvedValueOnce([
        { id: 't1', title: 'Low task', status: 'TODO', priority: 'LOW', userId: 'u1', description: null, deadline: null, subjectId: null },
        { id: 't2', title: 'High task', status: 'TODO', priority: 'HIGH', userId: 'u1', description: null, deadline: null, subjectId: null },
      ]);
      
      const res = await request(app.getHttpServer())
        .get('/tasks?sort=priority')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
        
      expect(res.body.status).toBe('success');
      expect(res.body.data.length).toBe(2);
      // HIGH priority should come first
      expect(res.body.data[0].priority).toBe('HIGH');
      expect(res.body.data[1].priority).toBe('LOW');
    });
  });

  // Notes flow

  describe('Notes Flow', () => {
    it('✅ /notes (POST) creates a note', async () => {
      prismaMock.note.upsert.mockResolvedValueOnce({});
      
      const res = await request(app.getHttpServer())
        .post('/notes')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Lecture 1', content: 'Clean Architecture intro' })
        .expect(201);
        
      expect(res.body.status).toBe('success');
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.title).toBe('Lecture 1');
    });

    it('✅ /notes/tree (GET) returns hierarchical Composite tree', async () => {
      prismaMock.note.findMany.mockResolvedValueOnce([
        { id: 'folder-1', title: 'Chapter 1', userId: 'u1', content: null, parentId: null, subjectId: null },
        { id: 'block-1', title: 'Section A', userId: 'u1', content: 'Theory text', parentId: 'folder-1', subjectId: null },
        { id: 'block-2', title: 'Standalone', userId: 'u1', content: 'My thoughts', parentId: null, subjectId: null },
      ]);
      
      const res = await request(app.getHttpServer())
        .get('/notes/tree')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
        
      expect(res.body.status).toBe('success');
      expect(res.body.data.length).toBe(2);

      const folder = res.body.data.find((n: any) => n.id === 'folder-1');
      expect(folder.type).toBe('section');
      expect(folder.children.length).toBe(1);
      expect(folder.children[0].id).toBe('block-1');
      expect(folder.children[0].type).toBe('block');
      expect(folder.children[0].content).toBe('Theory text');
    });
  });
});
