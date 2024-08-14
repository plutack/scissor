export class AuthError extends Error {
  type: string;
  constructor(type: string) {
    super(type);
    this.type = type;
  }
}
