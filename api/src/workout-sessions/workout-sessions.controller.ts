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
} from "@nestjs/common";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiQuery,
} from "@nestjs/swagger";
import { WorkoutSessionsService } from "./workout-sessions.service";
import { CreateSessionDto } from "./dto/create-session.dto";
import { UpdateSessionDto } from "./dto/update-session.dto";
import { SessionResponseDto } from "./dto/session-response.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import {
  CurrentUser,
  CurrentUserData,
} from "../common/decorators/current-user.decorator";

@ApiTags("sessions")
@ApiBearerAuth()
@Controller("sessions")
@UseGuards(JwtAuthGuard)
export class WorkoutSessionsController {
  constructor(private readonly sessionsService: WorkoutSessionsService) {}

  @Get()
  @ApiOkResponse({ type: [SessionResponseDto] })
  @ApiQuery({
    name: "month",
    required: false,
    example: "2026-05",
    description: "Filter by month (YYYY-MM)",
  })
  findAll(
    @CurrentUser() user: CurrentUserData,
    @Query("month") month?: string,
  ) {
    return this.sessionsService.findAll(user.id, month);
  }

  @Get(":id")
  @ApiOkResponse({ type: SessionResponseDto })
  async findOne(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    const session = await this.sessionsService.findOne(id, user.id);
    const lastSessionId = await this.sessionsService.findLastSessionByTemplate(
      user.id,
      session.template_id,
      session.id,
    );
    return { ...session, last_session_id: lastSessionId ?? null };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ type: SessionResponseDto })
  create(@Body() dto: CreateSessionDto, @CurrentUser() user: CurrentUserData) {
    return this.sessionsService.create(dto, user.id);
  }

  @Put(":id")
  @ApiOkResponse({ type: SessionResponseDto })
  update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateSessionDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.sessionsService.update(id, dto, user.id);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  remove(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.sessionsService.remove(id, user.id);
  }
}
