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
    return this.toDomainEntity(data);
  }

  async findById(id: string): Promise<UserEntity | null> {
    const data = await this.prisma.user.findUnique({ where: { id } });
    if (!data) return null;
    return this.toDomainEntity(data);
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

  /**
   * Maps a raw Prisma record to a UserEntity domain object.
   * Centralised to eliminate mapping duplication across find methods (DRY).
   */
  private toDomainEntity(data: {
    id: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    createdAt: Date;
    updatedAt: Date;
  }): UserEntity {
    return new UserEntity(
      data.id,
      data.email,
      data.password,
      data.firstName,
      data.lastName,
      data.createdAt,
      data.updatedAt
    );
  }
}
