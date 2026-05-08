import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';
import { SessionSet } from '../session-sets/entities/session-set.entity';
import { WorkoutSession } from '../workout-sessions/entities/workout-session.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SessionSet, WorkoutSession])],
  providers: [StatsService],
  controllers: [StatsController],
})
export class StatsModule {}
