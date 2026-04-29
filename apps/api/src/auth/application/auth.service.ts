import { Injectable, Inject, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { IUserRepository } from '../domain/user.repository.interface';
import { UserEntity } from '../domain/user.entity';
import { CreateUserDto } from '../presentation/dto/create-user.dto';
import { LoginUserDto } from '../presentation/dto/login-user.dto';
import { randomUUID } from 'crypto';

export interface UserProfileResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

@Injectable()
export class AuthService {
  constructor(
    @Inject('IUserRepository') private readonly userRepo: IUserRepository,
    private readonly jwtService: JwtService
  ) {}

  async register(dto: CreateUserDto): Promise<{ accessToken: string }> {
    const existing = await this.userRepo.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already in use');

    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(dto.password, salt);

    const userId = randomUUID();
    const user = new UserEntity({
      id: userId,
      email: dto.email,
      passwordHash: hash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
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

  async getProfile(userId: string): Promise<UserProfileResponse> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');
    return { 
      id: user.id, 
      email: user.email, 
      firstName: user.firstName, 
      lastName: user.lastName 
    };
  }

  async deleteAccount(userId: string): Promise<void> {
    await this.userRepo.delete(userId);
  }

  private generateToken(user: UserEntity): { accessToken: string } {
    const payload = { sub: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName };
    return { accessToken: this.jwtService.sign(payload) };
  }
}
