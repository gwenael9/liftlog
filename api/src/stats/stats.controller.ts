import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../common/decorators/current-user.decorator';

@ApiTags('stats')
@ApiBearerAuth()
@Controller('stats')
@UseGuards(JwtAuthGuard)
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('exercise/:exerciseId')
  getExerciseProgression(
    @Param('exerciseId', ParseUUIDPipe) exerciseId: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.statsService.getExerciseProgression(exerciseId, user.id);
  }

  @Get('volume')
  getVolume(
    @CurrentUser() user: CurrentUserData,
    @Query('weeks', new DefaultValuePipe(12), ParseIntPipe) weeks: number,
  ) {
    return this.statsService.getVolumePerWeek(user.id, weeks);
  }

  @Get('frequency')
  getFrequency(
    @CurrentUser() user: CurrentUserData,
    @Query('weeks', new DefaultValuePipe(12), ParseIntPipe) weeks: number,
  ) {
    return this.statsService.getFrequencyPerWeek(user.id, weeks);
  }

  @Get('prs')
  getPersonalRecords(@CurrentUser() user: CurrentUserData) {
    return this.statsService.getPersonalRecords(user.id);
  }
}
