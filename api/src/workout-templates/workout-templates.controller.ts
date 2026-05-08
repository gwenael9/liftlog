import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { WorkoutTemplatesService } from './workout-templates.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../common/decorators/current-user.decorator';

@ApiTags('templates')
@ApiBearerAuth()
@Controller('templates')
@UseGuards(JwtAuthGuard)
export class WorkoutTemplatesController {
  constructor(private readonly templatesService: WorkoutTemplatesService) {}

  @Get()
  findAll(@CurrentUser() user: CurrentUserData) {
    return this.templatesService.findAll(user.id);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.templatesService.findOne(id, user.id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateTemplateDto, @CurrentUser() user: CurrentUserData) {
    return this.templatesService.create(dto, user.id);
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTemplateDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.templatesService.update(id, dto, user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.templatesService.remove(id, user.id);
  }
}
