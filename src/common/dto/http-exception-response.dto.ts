import { ApiProperty } from '@nestjs/swagger';

/** Standard NestJS HTTP exception body (ValidationPipe, guards, HttpException). */
export class HttpExceptionResponseDto {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({
    oneOf: [
      { type: 'string', example: 'Unauthorized' },
      {
        type: 'array',
        items: { type: 'string' },
        example: ['title must be longer than or equal to 1 characters'],
      },
    ],
  })
  message: string | string[];

  @ApiProperty({ example: 'Bad Request' })
  error: string;
}
