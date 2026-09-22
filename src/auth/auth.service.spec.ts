import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: { user: { findUnique: jest.Mock; create: jest.Mock } };
  let jwtService: { signAsync: jest.Mock };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };

    jwtService = {
      signAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('deve criar um usuário quando o e-mail ainda não existe', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 'user-1',
        name: 'André',
        email: 'andre@teste.com',
        passwordHash: 'hash-fake',
        createdAt: new Date(),
      });

      const result = await service.register({
        name: 'André',
        email: 'andre@teste.com',
        password: '123456',
      });

      expect(result).not.toHaveProperty('passwordHash');
      expect(result.email).toBe('andre@teste.com');
      expect(prisma.user.create).toHaveBeenCalledTimes(1);
    });

    it('deve lançar ConflictException quando o e-mail já existe', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'andre@teste.com',
      });

      await expect(
        service.register({
          name: 'André',
          email: 'andre@teste.com',
          password: '123456',
        }),
      ).rejects.toThrow(ConflictException);

      expect(prisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('deve retornar um token quando as credenciais estão corretas', async () => {
      const passwordHash = await bcrypt.hash('123456', 10);

      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        name: 'André',
        email: 'andre@teste.com',
        passwordHash,
      });

      jwtService.signAsync.mockResolvedValue('token-fake');

      const result = await service.login({
        email: 'andre@teste.com',
        password: '123456',
      });

      expect(result.accessToken).toBe('token-fake');
      expect(result.user.email).toBe('andre@teste.com');
    });

    it('deve lançar UnauthorizedException quando o usuário não existe', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'naoexiste@teste.com', password: '123456' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('deve lançar UnauthorizedException quando a senha está errada', async () => {
      const passwordHash = await bcrypt.hash('senhacorreta', 10);

      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'andre@teste.com',
        passwordHash,
      });

      await expect(
        service.login({ email: 'andre@teste.com', password: 'senhaerrada' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});