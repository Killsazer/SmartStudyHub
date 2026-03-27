// File: src/auth/application/auth.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from '../domain/user.entity';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

const bcrypt = require('bcrypt');
jest.mock('bcrypt', () => ({
  genSalt: jest.fn().mockResolvedValue('salt'),
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn().mockResolvedValue(true),
}));

describe('AuthService', () => {
  let service: AuthService;
  let mockUserRepo: any;
  let mockJwtService: any;

  beforeEach(async () => {
    mockUserRepo = {
      findByEmail: jest.fn(),
      save: jest.fn(),
    };

    mockJwtService = {
      sign: jest.fn().mockReturnValue('mockToken123'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: 'IUserRepository', useValue: mockUserRepo },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
    // Re-set default mock behaviors after clearAllMocks
    bcrypt.genSalt.mockResolvedValue('salt');
    bcrypt.hash.mockResolvedValue('hashedPassword');
    bcrypt.compare.mockResolvedValue(true);
    mockJwtService.sign.mockReturnValue('mockToken123');
  });

  // ──────────────── REGISTER ────────────────

  describe('register', () => {
    const validDto = { email: 'new@kpi.ua', password: 'secureP@ss1', firstName: 'Vadym', lastName: 'Student' };

    it('✅ should hash password, save user, and return JWT token', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(null);

      const result = await service.register(validDto);

      // bcrypt was called correctly
      expect(bcrypt.genSalt).toHaveBeenCalledTimes(1);
      expect(bcrypt.hash).toHaveBeenCalledWith('secureP@ss1', 'salt');
      
      // User saved with hashed password (not plain text!)
      expect(mockUserRepo.save).toHaveBeenCalledTimes(1);
      const savedUser = mockUserRepo.save.mock.calls[0][0];
      expect(savedUser).toBeInstanceOf(UserEntity);
      expect(savedUser.email).toBe('new@kpi.ua');
      expect(savedUser.passwordHash).toBe('hashedPassword');
      expect(savedUser.passwordHash).not.toBe('secureP@ss1');  // Security check
      
      // Token generated with correct payload
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'new@kpi.ua' })
      );
      expect(result).toEqual({ accessToken: 'mockToken123' });
    });

    it('❌ should throw ConflictException when email already exists', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(
        new UserEntity('existing-id', 'new@kpi.ua', 'hash', 'A', 'B', new Date(), new Date())
      );

      await expect(service.register(validDto)).rejects.toThrow(ConflictException);
      
      // User should NOT be saved
      expect(mockUserRepo.save).not.toHaveBeenCalled();
    });

    it('🔄 should generate user ID with correct prefix', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(null);

      await service.register(validDto);

      const savedUser = mockUserRepo.save.mock.calls[0][0];
      expect(savedUser.id).toMatch(/^user-\d+$/);
    });

    it('🔄 should propagate repository errors', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(null);
      mockUserRepo.save.mockRejectedValue(new Error('DB connection lost'));

      await expect(service.register(validDto)).rejects.toThrow('DB connection lost');
    });
  });

  // ──────────────── LOGIN ────────────────

  describe('login', () => {
    const loginDto = { email: 'vadym@kpi.ua', password: 'correct-password' };

    it('✅ should return JWT token when credentials are valid', async () => {
      const user = new UserEntity('u1', 'vadym@kpi.ua', 'hashedPwd', 'Vadym', 'S', new Date(), new Date());
      mockUserRepo.findByEmail.mockResolvedValue(user);

      const result = await service.login(loginDto);

      expect(bcrypt.compare).toHaveBeenCalledWith('correct-password', 'hashedPwd');
      expect(mockJwtService.sign).toHaveBeenCalledWith({ sub: 'u1', email: 'vadym@kpi.ua' });
      expect(result).toEqual({ accessToken: 'mockToken123' });
    });

    it('❌ should throw UnauthorizedException when email not found', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(bcrypt.compare).not.toHaveBeenCalled(); // Should not even check password
    });

    it('❌ should throw UnauthorizedException when password is wrong', async () => {
      const user = new UserEntity('u1', 'vadym@kpi.ua', 'hashedPwd', 'Vadym', 'S', new Date(), new Date());
      mockUserRepo.findByEmail.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(false); // Wrong password

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(mockJwtService.sign).not.toHaveBeenCalled(); // Token should NOT be generated
    });
  });
});
