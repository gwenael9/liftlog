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
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { WorkoutSessionsService } from './workout-sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../common/decorators/current-user.decorator';

@ApiTags('sessions')
@ApiBearerAuth()
@Controller('sessions')
@UseGuards(JwtAuthGuard)
export class WorkoutSessionsController {
  constructor(private readonly sessionsService: WorkoutSessionsService) {}

  @Get()
  findAll(
    @CurrentUser() user: CurrentUserData,
    @Query('month') month?: string,
  ) {
    return this.sessionsService.findAll(user.id, month);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.sessionsService.findOne(id, user.id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateSessionDto, @CurrentUser() user: CurrentUserData) {
    return this.sessionsService.create(dto, user.id);
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSessionDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.sessionsService.update(id, dto, user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.sessionsService.remove(id, user.id);
  }
}
