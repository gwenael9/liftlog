import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exercise, MuscleGroup } from './entities/exercise.entity';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';

@Injectable()
export class ExercisesService {
  constructor(
    @InjectRepository(Exercise)
    private readonly exercisesRepository: Repository<Exercise>,
  ) {}

  async findAll(userId: string, muscleGroup?: MuscleGroup): Promise<Exercise[]> {
    const muscleFilter = muscleGroup ? { muscle_group: muscleGroup } : {};
    return this.exercisesRepository.find({
      where: [
        { is_global: true, ...muscleFilter },
        { created_by: userId, ...muscleFilter },
      ],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Exercise> {
    const exercise = await this.exercisesRepository.findOne({ where: { id } });
    if (!exercise) {
      throw new NotFoundException('Exercise not found');
    }
    if (!exercise.is_global && exercise.created_by !== userId) {
      throw new ForbiddenException('Access denied');
    }
    return exercise;
  }

  async create(dto: CreateExerciseDto, userId: string): Promise<Exercise> {
    const exercise = this.exercisesRepository.create({
      ...dto,
      created_by: userId,
      is_global: false,
    });
    return this.exercisesRepository.save(exercise);
  }

  async update(id: string, dto: UpdateExerciseDto, userId: string): Promise<Exercise> {
    const exercise = await this.exercisesRepository.findOne({ where: { id } });
    if (!exercise) {
      throw new NotFoundException('Exercise not found');
    }
    if (exercise.created_by !== userId) {
      throw new ForbiddenException('You can only modify your own exercises');
    }

    Object.assign(exercise, dto);
    return this.exercisesRepository.save(exercise);
  }

  async remove(id: string, userId: string): Promise<void> {
    const exercise = await this.exercisesRepository.findOne({ where: { id } });
    if (!exercise) {
      throw new NotFoundException('Exercise not found');
    }
    if (exercise.created_by !== userId) {
      throw new ForbiddenException('You can only delete your own exercises');
    }
    await this.exercisesRepository.remove(exercise);
  }
}
