import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PeriodQueryDto } from './dto/period-query.dto';

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