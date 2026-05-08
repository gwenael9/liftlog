import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../common/decorators/current-user.decorator';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMe(@CurrentUser() user: CurrentUserData) {
    return this.usersService.getMe(user.id);
  }

  @Put('me')
  @HttpCode(HttpStatus.OK)
  updateMe(@CurrentUser() user: CurrentUserData, @Body() dto: UpdateUserDto) {
    return this.usersService.update(user.id, dto);
  }
}
