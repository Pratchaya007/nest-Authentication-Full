import { PickType } from '@nestjs/swagger';
import { CreateBaseDto } from 'src/user/dtos/create-base.dto';

export class LoginDto extends PickType(CreateBaseDto, ['email', 'password']) {}
