import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PeriodQueryDto } from './dto/period-query.dto';

@ApiTags('reports')
@ApiBearerAuth()
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('summary')
  getSummary(@CurrentUser() user: any, @Query() query: PeriodQueryDto) {
    return this.reportsService.getSummary(user.id, query);
  }

  @Get('by-category')
  getByCategory(@CurrentUser() user: any, @Query() query: PeriodQueryDto) {
    return this.reportsService.getByCategory(user.id, query);
  }
}