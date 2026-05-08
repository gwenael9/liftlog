import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExercisesService } from './exercises.service';
import { ExercisesController } from './exercises.controller';
import { Exercise } from './entities/exercise.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Exercise])],
  providers: [ExercisesService],
  controllers: [ExercisesController],
  exports: [ExercisesService],
})
export class ExercisesModule {}
