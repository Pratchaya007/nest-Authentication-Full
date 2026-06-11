import { BadRequestException, ValidationPipe } from '@nestjs/common';

export class GlobalValidationPipe extends ValidationPipe {
  constructor() {
    super({
      transform: true,
      whitelist: true,
      exceptionFactory(errors) {
        const formatedErrors = errors.reduce<Record<string, string[]>>(
          (acc, el) => {
            if (el.constraints)
              acc[el.property] = Object.values(el.constraints);
            return acc;
          },
          {},
        );
        throw new BadRequestException({
          message: 'The provided data is invalid',
          code: 'Validation Error',
          details: formatedErrors,
        });
      },
    });
  }
}
