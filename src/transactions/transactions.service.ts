import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  private async validateCategory(userId: string, categoryId: string, type: string) {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException('Categoria não encontrada.');
    }

    if (category.userId !== userId) {
      throw new ForbiddenException('Você não tem acesso a essa categoria.');
    }

    if (category.type !== type) {
      throw new BadRequestException(
        `Essa categoria é do tipo ${category.type}, incompatível com uma transação do tipo ${type}.`,
      );
    }
  }

  async create(userId: string, dto: CreateTransactionDto) {
    await this.validateCategory(userId, dto.categoryId, dto.type);

    return this.prisma.transaction.create({
      data: {
        ...dto,
        userId,
      },
    });
  }

  findAll(userId: string) {
    return this.prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      include: { category: true },
    });
  }

  async findOne(userId: string, id: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!transaction) {
      throw new NotFoundException('Transação não encontrada.');
    }

    if (transaction.userId !== userId) {
      throw new ForbiddenException('Você não tem acesso a essa transação.');
    }

    return transaction;
  }

  async update(userId: string, id: string, dto: UpdateTransactionDto) {
    const transaction = await this.findOne(userId, id);

    const categoryId = dto.categoryId ?? transaction.categoryId;
    const type = dto.type ?? transaction.type;

    await this.validateCategory(userId, categoryId, type);

    return this.prisma.transaction.update({
      where: { id },
      data: dto,
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);

    await this.prisma.transaction.delete({
      where: { id },
    });

    return { message: 'Transação removida com sucesso.' };
  }
}