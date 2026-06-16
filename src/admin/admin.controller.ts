import { Controller, Delete, Get, Param } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { UserService } from 'src/user/user.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly userService: UserService) {}

  @Get('users')
  @ApiOperation({ summary: 'List all users - admin only' })
  findAll() {
    return this.userService.findAll();
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete a user - admin only' })
  remove(@Param('id') id: string) {
    return this.userService.delete(id);
  }
}
