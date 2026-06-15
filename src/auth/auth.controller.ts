import { Body, Controller, Param, Post } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { RegisterDto } from './dtos/register-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() register: RegisterDto) {
    return this.authService.create(register);
  }

  @Post('login')
  login(@Body('user') user: string) {
    console.log(user);
  }
}
