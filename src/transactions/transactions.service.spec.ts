import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { PrismaService } from '../prisma/prisma.service';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let prisma: {
    category: { findUnique: jest.Mock };
    transaction: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  const userId = 'user-1';
  const categoryId = 'category-1';

  beforeEach(async () => {
    prisma = {
      category: {
        findUnique: jest.fn(),
      },
      transaction: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
  });

  describe('create', () => {
    const dto = {
      description: 'Compras do mês',
      amount: 450.9,
      type: 'EXPENSE' as const,
      date: new Date('2026-09-22'),
      categoryId,
    };

    it('deve criar a transação quando a categoria existe, é do usuário e o tipo é compatível', async () => {
      prisma.category.findUnique.mockResolvedValue({
        id: categoryId,
        userId,
        type: 'EXPENSE',
      });
      prisma.transaction.create.mockResolvedValue({ id: 'transaction-1', ...dto, userId });

      const result = await service.create(userId, dto);

      expect(result).toHaveProperty('id', 'transaction-1');
      expect(prisma.transaction.create).toHaveBeenCalledTimes(1);
    });

    it('deve lançar NotFoundException quando a categoria não existe', async () => {
      prisma.category.findUnique.mockResolvedValue(null);

      await expect(service.create(userId, dto)).rejects.toThrow(NotFoundException);
      expect(prisma.transaction.create).not.toHaveBeenCalled();
    });

    it('deve lançar ForbiddenException quando a categoria é de outro usuário', async () => {
      prisma.category.findUnique.mockResolvedValue({
        id: categoryId,
        userId: 'outro-usuario',
        type: 'EXPENSE',
      });

      await expect(service.create(userId, dto)).rejects.toThrow(ForbiddenException);
      expect(prisma.transaction.create).not.toHaveBeenCalled();
    });

    it('deve lançar BadRequestException quando o tipo da transação não bate com o da categoria', async () => {
      prisma.category.findUnique.mockResolvedValue({
        id: categoryId,
        userId,
        type: 'INCOME',
      });

      await expect(service.create(userId, dto)).rejects.toThrow(BadRequestException);
      expect(prisma.transaction.create).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('deve retornar a transação quando ela pertence ao usuário', async () => {
      prisma.transaction.findUnique.mockResolvedValue({
        id: 'transaction-1',
        userId,
        category: { id: categoryId },
      });

      const result = await service.findOne(userId, 'transaction-1');

      expect(result.id).toBe('transaction-1');
    });

    it('deve lançar NotFoundException quando a transação não existe', async () => {
      prisma.transaction.findUnique.mockResolvedValue(null);

      await expect(service.findOne(userId, 'inexistente')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve lançar ForbiddenException quando a transação é de outro usuário', async () => {
      prisma.transaction.findUnique.mockResolvedValue({
        id: 'transaction-1',
        userId: 'outro-usuario',
        category: { id: categoryId },
      });

      await expect(service.findOne(userId, 'transaction-1')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});