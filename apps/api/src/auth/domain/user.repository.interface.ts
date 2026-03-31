// File: src/auth/domain/user.repository.interface.ts
import { UserEntity } from './user.entity';

export interface IUserRepository {
  findByEmail(email: string): Promise<UserEntity | null>;
  findById(id: string): Promise<UserEntity | null>;
  save(user: UserEntity): Promise<void>;
}
