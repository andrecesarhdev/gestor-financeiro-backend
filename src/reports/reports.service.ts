import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PeriodQueryDto } from './dto/period-query.dto';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  private getPeriodRange(query: PeriodQueryDto) {
    const now = new Date();
    const month = query.month ?? now.getMonth() + 1;
    const year = query.year ?? now.getFullYear();

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    return { startDate, endDate };
  }

  async getSummary(userId: string, query: PeriodQueryDto) {
    const { startDate, endDate } = this.getPeriodRange(query);

    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: startDate, lt: endDate },
      },
    });

    const totalIncome = transactions
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpense = transactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
    };
  }

  async getByCategory(userId: string, query: PeriodQueryDto) {
    const { startDate, endDate } = this.getPeriodRange(query);

    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: startDate, lt: endDate },
      },
      include: { category: true },
    });

    const grouped = new Map<string, {
      categoryId: string;
      name: string;
      color: string;
      type: string;
      total: number;
    }>();

    for (const t of transactions) {
      const key = t.categoryId;
      const existing = grouped.get(key);

      if (existing) {
        existing.total += Number(t.amount);
      } else {
        grouped.set(key, {
          categoryId: t.categoryId,
          name: t.category.name,
          color: t.category.color,
          type: t.category.type,
          total: Number(t.amount),
        });
      }
    }

    return Array.from(grouped.values());
  }
}