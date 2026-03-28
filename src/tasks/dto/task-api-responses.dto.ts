import { ApiProperty } from '@nestjs/swagger';

export class TaskItemDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Buy milk', maxLength: 200 })
  title: string;

  @ApiProperty({ example: false })
  done: boolean;

  @ApiProperty({ format: 'date-time' })
  createdAt: string;

  @ApiProperty({ format: 'uuid' })
  userId: string;
}

export class ListTasksSuccessDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Tasks listed successfully' })
  message: string;

  @ApiProperty({ type: [TaskItemDto] })
  items: TaskItemDto[];

  @ApiProperty({ example: 1, minimum: 1 })
  page: number;

  @ApiProperty({ example: 10, minimum: 1 })
  pageSize: number;

  @ApiProperty({ example: 42 })
  total: number;

  @ApiProperty({ example: 5 })
  totalPages: number;
}

export class TaskMutationSuccessDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Task created successfully' })
  message: string;

  @ApiProperty({ type: TaskItemDto })
  data: TaskItemDto;
}

export class ToggleTaskSuccessDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Task toggled successfully' })
  message: string;

  @ApiProperty({ type: TaskItemDto })
  data: TaskItemDto;
}
