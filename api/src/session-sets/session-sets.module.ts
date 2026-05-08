import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionSetsService } from './session-sets.service';
import { SessionSetsController } from './session-sets.controller';
import { SessionSet } from './entities/session-set.entity';
import { WorkoutSession } from '../workout-sessions/entities/workout-session.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SessionSet, WorkoutSession])],
  providers: [SessionSetsService],
  controllers: [SessionSetsController],
  exports: [SessionSetsService],
})
export class SessionSetsModule {}
