import { Controller, Get } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { Auth } from './auth/decorators/auth.decorators';
import { AuthType } from './auth/enums/auth-types.enum';
import { AppService } from './app.service';

@Auth(AuthType.None)
@ApiExcludeController()
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
