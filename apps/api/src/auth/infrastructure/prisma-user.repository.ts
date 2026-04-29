import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { IUserRepository } from '../domain/user.repository.interface';
import { UserEntity, UserProps } from '../domain/user.entity';

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

  async save(user: UserEntity): Promise<UserEntity> {
    const savedData = await this.prisma.user.upsert({
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

    return this.toDomainEntity(savedData);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }

  private toDomainEntity(data: {
    id: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    createdAt: Date;
    updatedAt: Date;
  }): UserEntity {
    const props: UserProps = {
      id: data.id,
      email: data.email,
      passwordHash: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
    return new UserEntity(props);
  }
}
