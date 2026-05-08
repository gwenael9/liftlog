import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkoutTemplatesService } from './workout-templates.service';
import { WorkoutTemplatesController } from './workout-templates.controller';
import { WorkoutTemplate } from './entities/workout-template.entity';
import { TemplateExercise } from './entities/template-exercise.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WorkoutTemplate, TemplateExercise])],
  providers: [WorkoutTemplatesService],
  controllers: [WorkoutTemplatesController],
  exports: [WorkoutTemplatesService],
})
export class WorkoutTemplatesModule {}
