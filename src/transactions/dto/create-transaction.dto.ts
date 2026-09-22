import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsNumber, IsPositive, IsString, IsUUID, MinLength } from 'class-validator';
import { TransactionType } from '../../generated/prisma/client';

export class CreateTransactionDto {
  @IsString()
  @MinLength(2)
  description!: string;

  @IsNumber()
  @IsPositive()
  amount!: number;

  @IsEnum(TransactionType)
  type!: TransactionType;

  @IsDate()
  @Type(() => Date)
  date!: Date;

  @IsUUID()
  categoryId!: string;
}