import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let prisma: {
    category: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  const userId = 'user-1';

  beforeEach(async () => {
    prisma = {
      category: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  describe('create', () => {
    it('deve criar uma categoria vinculada ao usuário', async () => {
      const dto = { name: 'Supermercado', type: 'EXPENSE' as const, color: '#EF4444' };
      prisma.category.create.mockResolvedValue({ id: 'category-1', ...dto, userId });

      const result = await service.create(userId, dto);

      expect(result).toHaveProperty('id', 'category-1');
      expect(prisma.category.create).toHaveBeenCalledWith({
        data: { ...dto, userId },
      });
    });
  });

  describe('findOne', () => {
    it('deve retornar a categoria quando ela pertence ao usuário', async () => {
      prisma.category.findUnique.mockResolvedValue({ id: 'category-1', userId });

      const result = await service.findOne(userId, 'category-1');

      expect(result.id).toBe('category-1');
    });

    it('deve lançar NotFoundException quando a categoria não existe', async () => {
      prisma.category.findUnique.mockResolvedValue(null);

      await expect(service.findOne(userId, 'inexistente')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve lançar ForbiddenException quando a categoria é de outro usuário', async () => {
      prisma.category.findUnique.mockResolvedValue({
        id: 'category-1',
        userId: 'outro-usuario',
      });

      await expect(service.findOne(userId, 'category-1')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('remove', () => {
    it('deve deletar a categoria quando ela pertence ao usuário', async () => {
      prisma.category.findUnique.mockResolvedValue({ id: 'category-1', userId });
      prisma.category.delete.mockResolvedValue({ id: 'category-1' });

      const result = await service.remove(userId, 'category-1');

      expect(result.message).toBe('Categoria removida com sucesso.');
      expect(prisma.category.delete).toHaveBeenCalledWith({
        where: { id: 'category-1' },
      });
    });

    it('não deve deletar quando a categoria é de outro usuário', async () => {
      prisma.category.findUnique.mockResolvedValue({
        id: 'category-1',
        userId: 'outro-usuario',
      });

      await expect(service.remove(userId, 'category-1')).rejects.toThrow(
        ForbiddenException,
      );
      expect(prisma.category.delete).not.toHaveBeenCalled();
    });
  });
});