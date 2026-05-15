import {
  Controller,
  Get,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from "@nestjs/common";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOkResponse,
  ApiQuery,
} from "@nestjs/swagger";
import { StatsService } from "./stats.service";
import { ExerciseProgressionPointDto } from "./dto/exercise-progression.dto";
import { PersonalRecordDto } from "./dto/personal-record.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import {
  CurrentUser,
  CurrentUserData,
} from "../common/decorators/current-user.decorator";

@ApiTags("stats")
@ApiBearerAuth()
@Controller("stats")
@UseGuards(JwtAuthGuard)
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get("exercise/:exerciseId")
  @ApiOkResponse({ type: [ExerciseProgressionPointDto] })
  getExerciseProgression(
    @Param("exerciseId", ParseUUIDPipe) exerciseId: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.statsService.getExerciseProgression(exerciseId, user.id);
  }

  @Get("activity-dates")
  @ApiOkResponse({
    schema: {
      type: "array",
      items: {
        type: "object",
        properties: {
          date: { type: "string", example: "2026-05-14" },
          session_id: { type: "string", format: "uuid" },
        },
        required: ["date", "session_id"],
      },
    },
  })
  getActivityDates(@CurrentUser() user: CurrentUserData) {
    return this.statsService.getActivityDates(user.id);
  }

  @Get("prs")
  @ApiOkResponse({ type: [PersonalRecordDto] })
  getPersonalRecords(@CurrentUser() user: CurrentUserData) {
    return this.statsService.getPersonalRecords(user.id);
  }
}
