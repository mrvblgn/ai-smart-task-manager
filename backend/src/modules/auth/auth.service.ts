import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import type { IUserRepository } from "../user/user.repository.js";
import type { UserDocument, UserRole } from "../user/user.interface.js";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export class AuthError extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "AuthError";
    this.statusCode = statusCode;
  }
}

export class ConflictError extends AuthError {
  constructor(message: string) {
    super(message, 409);
    this.name = "ConflictError";
  }
}

export class UnauthorizedError extends AuthError {
  constructor(message: string) {
    super(message, 401);
    this.name = "UnauthorizedError";
  }
}

export class ValidationError extends AuthError {
  constructor(message: string) {
    super(message, 400);
    this.name = "ValidationError";
  }
}

export class AuthService {
  private readonly userRepository: IUserRepository;
  private readonly saltRounds = 12;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await this.userRepository.findByEmail(normalizedEmail);
    if (existingUser) {
      throw new ConflictError("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, this.saltRounds);

    const user = await this.userRepository.createUser({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    const token = this.generateToken(user.id, user.role);
    return {
      token,
      user: this.sanitizeUser(user),
    };
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const normalizedEmail = email.trim().toLowerCase();

    const user = await this.userRepository.findByEmail(normalizedEmail);
    if (!user) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const token = this.generateToken(user.id, user.role);
    return {
      token,
      user: this.sanitizeUser(user),
    };
  }

  generateToken(userId: string, role: string): string {
    return jwt.sign({ sub: userId, role }, env.jwtSecret, { expiresIn: "1d" });
  }

  private sanitizeUser(user: UserDocument): AuthUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }
}
