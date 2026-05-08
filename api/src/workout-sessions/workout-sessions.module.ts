import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkoutSessionsService } from './workout-sessions.service';
import { WorkoutSessionsController } from './workout-sessions.controller';
import { WorkoutSession } from './entities/workout-session.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WorkoutSession])],
  providers: [WorkoutSessionsService],
  controllers: [WorkoutSessionsController],
  exports: [WorkoutSessionsService],
})
export class WorkoutSessionsModule {}
