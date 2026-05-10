import {
  Controller,
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
import {
  ApiTags,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNoContentResponse,
} from '@nestjs/swagger';
import { SessionSetsService } from './session-sets.service';
import { CreateSetDto } from './dto/create-set.dto';
import { UpdateSetDto } from './dto/update-set.dto';
import { BulkUpdateSetsDto } from './dto/bulk-update-sets.dto';
import { SetResponseDto } from './dto/set-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../common/decorators/current-user.decorator';

@ApiTags('session-sets')
@ApiBearerAuth()
@Controller('sessions/:sessionId/sets')
@UseGuards(JwtAuthGuard)
export class SessionSetsController {
  constructor(private readonly setsService: SessionSetsService) {}

  @Put('bulk')
  @ApiOkResponse({ type: [SetResponseDto] })
  bulkUpdate(
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
    @Body() dto: BulkUpdateSetsDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.setsService.bulkUpdate(sessionId, dto, user.id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ type: SetResponseDto })
  create(
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
    @Body() dto: CreateSetDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.setsService.create(sessionId, dto, user.id);
  }

  @Put(':id')
  @ApiOkResponse({ type: SetResponseDto })
  update(
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSetDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.setsService.update(sessionId, id, dto, user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  remove(
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.setsService.remove(sessionId, id, user.id);
  }
}
