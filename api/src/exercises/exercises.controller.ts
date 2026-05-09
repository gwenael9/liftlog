import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { ExercisesService } from './exercises.service';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { ExerciseResponseDto } from './dto/exercise-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, CurrentUserData } from '../common/decorators/current-user.decorator';
import { MuscleGroup } from './entities/exercise.entity';

@ApiTags('exercises')
@ApiBearerAuth()
@Controller('exercises')
@UseGuards(JwtAuthGuard)
export class ExercisesController {
  constructor(private readonly exercisesService: ExercisesService) {}

  @Get()
  @ApiOkResponse({ type: [ExerciseResponseDto] })
  @ApiQuery({ name: 'muscle_group', enum: MuscleGroup, required: false })
  findAll(
    @CurrentUser() user: CurrentUserData,
    @Query('muscle_group') muscleGroup?: MuscleGroup,
  ) {
    return this.exercisesService.findAll(user.id, muscleGroup, user.role === 'admin');
  }

  @Get(':id')
  @ApiOkResponse({ type: ExerciseResponseDto })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.exercisesService.findOne(id, user.id, user.role === 'admin');
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ type: ExerciseResponseDto })
  create(@Body() dto: CreateExerciseDto, @CurrentUser() user: CurrentUserData) {
    return this.exercisesService.create(dto, user.id, true);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOkResponse({ type: ExerciseResponseDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateExerciseDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.exercisesService.update(id, dto, user.id, true);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.exercisesService.remove(id, user.id, true);
  }
}
