export class UserEntity {
  constructor(
    public readonly id: string,
    public email: string,
    public passwordHash: string,
    public firstName: string,
    public lastName: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
