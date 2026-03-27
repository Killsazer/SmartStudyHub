// File: src/auth/infrastructure/prisma-user.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { IUserRepository } from '../domain/user.repository.interface';
import { UserEntity } from '../domain/user.entity';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<UserEntity | null> {
    const data = await this.prisma.user.findUnique({ where: { email } });
    if (!data) return null;
    return new UserEntity(data.id, data.email, data.password, data.firstName, data.lastName, data.createdAt, data.updatedAt);
  }

  async save(user: UserEntity): Promise<void> {
    await this.prisma.user.upsert({
      where: { id: user.id },
      update: {
        email: user.email,
        password: user.passwordHash,
        firstName: user.firstName,
        lastName: user.lastName
      },
      create: {
        id: user.id,
        email: user.email,
        password: user.passwordHash,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  }
}
