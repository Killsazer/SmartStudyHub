// File: src/application/services/auth.service.ts
import { Injectable, Inject, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { UserEntity } from '../../domain/entities/user.entity';
import { CreateUserDto } from '../../presentation/dtos/create-user.dto';
import { LoginUserDto } from '../../presentation/dtos/login-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject('IUserRepository') private readonly userRepo: IUserRepository,
    private readonly jwtService: JwtService
  ) {}

  async register(dto: CreateUserDto): Promise<{ accessToken: string }> {
    const existing = await this.userRepo.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already in use');

    // Хешування пароля за допомогою bcrypt у Security слої 
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(dto.password, salt);

    const userId = `user-${Date.now()}`;
    const user = new UserEntity(userId, dto.email, hash, dto.firstName, dto.lastName, new Date(), new Date());
    
    await this.userRepo.save(user);

    return this.generateToken(user);
  }

  async login(dto: LoginUserDto): Promise<{ accessToken: string }> {
    const user = await this.userRepo.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    return this.generateToken(user);
  }

  private generateToken(user: UserEntity) {
    const payload = { sub: user.id, email: user.email };
    return { accessToken: this.jwtService.sign(payload) };
  }
}
