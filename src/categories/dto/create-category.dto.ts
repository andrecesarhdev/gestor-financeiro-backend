import { IsEnum, IsString, IsHexColor, MinLength } from 'class-validator';
import { TransactionType } from '../../generated/prisma/client';

export class CreateCategoryDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsEnum(TransactionType)
  type!: TransactionType;

  @IsHexColor()
  color!: string;
}