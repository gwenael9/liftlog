import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkoutTemplate } from './entities/workout-template.entity';
import { TemplateExercise } from './entities/template-exercise.entity';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';

@Injectable()
export class WorkoutTemplatesService {
  constructor(
    @InjectRepository(WorkoutTemplate)
    private readonly templatesRepository: Repository<WorkoutTemplate>,
    @InjectRepository(TemplateExercise)
    private readonly templateExercisesRepository: Repository<TemplateExercise>,
  ) {}

  async findAll(userId: string): Promise<WorkoutTemplate[]> {
    return this.templatesRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<WorkoutTemplate> {
    const template = await this.templatesRepository.findOne({
      where: { id },
      relations: ['template_exercises', 'template_exercises.exercise'],
    });
    if (!template) {
      throw new NotFoundException('Template not found');
    }
    if (template.user_id !== userId) {
      throw new ForbiddenException('Access denied');
    }
    template.template_exercises.sort((a, b) => a.order_index - b.order_index);
    return template;
  }

  async create(dto: CreateTemplateDto, userId: string): Promise<WorkoutTemplate> {
    const template = this.templatesRepository.create({
      user_id: userId,
      name: dto.name,
      description: dto.description ?? null,
      estimated_duration: dto.estimated_duration ?? null,
    });
    const saved = await this.templatesRepository.save(template);

    if (dto.exercises && dto.exercises.length > 0) {
      const templateExercises = dto.exercises.map((ex) =>
        this.templateExercisesRepository.create({
          template_id: saved.id,
          exercise_id: ex.exercise_id,
          order_index: ex.order_index,
          target_sets: ex.target_sets ?? null,
          target_reps: ex.target_reps ?? null,
          rest_seconds: ex.rest_seconds ?? null,
        }),
      );
      await this.templateExercisesRepository.save(templateExercises);
    }

    return this.findOne(saved.id, userId);
  }

  async update(id: string, dto: UpdateTemplateDto, userId: string): Promise<WorkoutTemplate> {
    const template = await this.templatesRepository.findOne({ where: { id } });
    if (!template) {
      throw new NotFoundException('Template not found');
    }
    if (template.user_id !== userId) {
      throw new ForbiddenException('Access denied');
    }

    if (dto.name !== undefined) template.name = dto.name;
    if (dto.description !== undefined) template.description = dto.description;
    if (dto.estimated_duration !== undefined) template.estimated_duration = dto.estimated_duration;

    await this.templatesRepository.save(template);

    if (dto.exercises !== undefined) {
      await this.templateExercisesRepository.delete({ template_id: id });
      if (dto.exercises.length > 0) {
        const templateExercises = dto.exercises.map((ex) =>
          this.templateExercisesRepository.create({
            template_id: id,
            exercise_id: ex.exercise_id,
            order_index: ex.order_index,
            target_sets: ex.target_sets ?? null,
            target_reps: ex.target_reps ?? null,
            rest_seconds: ex.rest_seconds ?? null,
          }),
        );
        await this.templateExercisesRepository.save(templateExercises);
      }
    }

    return this.findOne(id, userId);
  }

  async remove(id: string, userId: string): Promise<void> {
    const template = await this.templatesRepository.findOne({ where: { id } });
    if (!template) {
      throw new NotFoundException('Template not found');
    }
    if (template.user_id !== userId) {
      throw new ForbiddenException('Access denied');
    }
    await this.templatesRepository.remove(template);
  }
}
