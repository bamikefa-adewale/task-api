import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

export class ListTasksQueryDto {
  @ApiPropertyOptional({
    description: 'Page number (1-based)',
    minimum: 1,
    default: DEFAULT_PAGE,
    example: 1,
  })
  @IsOptional()
  @Transform(({ value }) => (value === undefined || value === '' ? DEFAULT_PAGE : Number(value)))
  @IsInt()
  @Min(1)
  page: number = DEFAULT_PAGE;

  @ApiPropertyOptional({
    description: 'Items per page',
    minimum: 1,
    maximum: MAX_PAGE_SIZE,
    default: DEFAULT_PAGE_SIZE,
    example: 10,
  })
  @IsOptional()
  @Transform(({ value }) =>
    value === undefined || value === '' ? DEFAULT_PAGE_SIZE : Number(value),
  )
  @IsInt()
  @Min(1)
  @Max(MAX_PAGE_SIZE)
  pageSize: number = DEFAULT_PAGE_SIZE;

  @ApiPropertyOptional({
    description: 'Case-sensitive substring filter on task title',
    example: 'milk',
    minLength: 1,
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MinLength(1)
  q?: string;
}

export { MAX_PAGE_SIZE };
