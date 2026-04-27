export interface UserProps {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
  updatedAt: Date;
}

export class UserEntity {
  public readonly id: string;
  public email: string;
  public passwordHash: string;
  public firstName: string;
  public lastName: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: UserProps) {
    this.id = props.id;
    this.email = props.email;
    this.passwordHash = props.passwordHash;
    this.firstName = props.firstName;
    this.lastName = props.lastName;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
