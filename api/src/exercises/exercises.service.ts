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

  async findAll(userId: string, muscleGroup?: MuscleGroup, isAdmin = false): Promise<Exercise[]> {
    if (isAdmin) {
      const muscleFilter = muscleGroup ? { muscle_group: muscleGroup } : {};
      return this.exercisesRepository.find({ where: muscleFilter, order: { name: 'ASC' } });
    }
    const muscleFilter = muscleGroup ? { muscle_group: muscleGroup } : {};
    return this.exercisesRepository.find({
      where: [
        { is_global: true, ...muscleFilter },
        { created_by: userId, ...muscleFilter },
      ],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string, userId: string, isAdmin = false): Promise<Exercise> {
    const exercise = await this.exercisesRepository.findOne({ where: { id } });
    if (!exercise) {
      throw new NotFoundException('Exercise not found');
    }
    if (!isAdmin && !exercise.is_global && exercise.created_by !== userId) {
      throw new ForbiddenException('Access denied');
    }
    return exercise;
  }

  async create(dto: CreateExerciseDto, userId: string, isAdmin = false): Promise<Exercise> {
    const exercise = this.exercisesRepository.create({
      ...dto,
      created_by: userId,
      is_global: isAdmin,
    });
    return this.exercisesRepository.save(exercise);
  }

  async update(id: string, dto: UpdateExerciseDto, userId: string, isAdmin = false): Promise<Exercise> {
    const exercise = await this.exercisesRepository.findOne({ where: { id } });
    if (!exercise) {
      throw new NotFoundException('Exercise not found');
    }
    if (!isAdmin && exercise.created_by !== userId) {
      throw new ForbiddenException('You can only modify your own exercises');
    }

    Object.assign(exercise, dto);
    return this.exercisesRepository.save(exercise);
  }

  async remove(id: string, userId: string, isAdmin = false): Promise<void> {
    const exercise = await this.exercisesRepository.findOne({ where: { id } });
    if (!exercise) {
      throw new NotFoundException('Exercise not found');
    }
    if (!isAdmin && exercise.created_by !== userId) {
      throw new ForbiddenException('You can only delete your own exercises');
    }
    await this.exercisesRepository.remove(exercise);
  }
}
