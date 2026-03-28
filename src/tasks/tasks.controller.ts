import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { HttpExceptionResponseDto } from 'src/common/dto/http-exception-response.dto';
import { GetUserId } from 'src/auth/decorators/user.decorator';
import { Auth } from 'src/auth/decorators/auth.decorators';
import { AuthType } from 'src/auth/enums/auth-types.enum';
import { CreateTaskDto } from './dto/create-task.dto';
import { ListTasksQueryDto } from './dto/list-tasks-query.dto';
import {
  ListTasksSuccessDto,
  TaskMutationSuccessDto,
  ToggleTaskSuccessDto,
} from './dto/task-api-responses.dto';
import { TasksService } from './tasks.service';

@ApiTags('Tasks')
@ApiBearerAuth()
@Auth(AuthType.Bearer)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) { }

  @Get()
  @ApiOperation({
    summary: 'List tasks (paginated, optional search)',
    description:
      'Returns the current user’s tasks. Use `page`, `pageSize`, and optional `q` to filter and paginate.',
  })
  @ApiOkResponse({
    description: 'Paginated task list',
    type: ListTasksSuccessDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid bearer token',
    type: HttpExceptionResponseDto,
  })
  async list(
    @GetUserId() userId: string,
    @Query() query: ListTasksQueryDto,
  ) {
    const data = await this.tasksService.list(userId, query);
    return {
      success: true,
      message: 'Tasks listed successfully',
      items: data.items,
      page: data.page,
      pageSize: data.pageSize,
      total: data.total,
      totalPages: data.totalPages,



    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create task',
    description: 'Creates a task for the authenticated user. Title is trimmed before save.',
  })
  @ApiCreatedResponse({
    description: 'Task created',
    type: TaskMutationSuccessDto,
  })
  @ApiBadRequestResponse({
    description: 'Validation failed (e.g. empty title, title too long)',
    type: HttpExceptionResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid bearer token',
    type: HttpExceptionResponseDto,
  })
  async create(
    @GetUserId() userId: string,
    @Body() dto: CreateTaskDto,
  ) {
    const data = await this.tasksService.create(userId, dto);
    return {
      success: true,
      message: 'Task created successfully',
      data: data,
    };
  }

  @Patch(':id/toggle')
  @ApiOperation({
    summary: 'Toggle task done',
    description: 'Flips the `done` flag for a task that belongs to the current user.',
  })
  @ApiParam({
    name: 'id',
    description: 'Task UUID',
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Task updated',
    type: ToggleTaskSuccessDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid UUID',
    type: HttpExceptionResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid bearer token',
    type: HttpExceptionResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Task not found or not owned by the user',
    type: HttpExceptionResponseDto,
  })
  async toggle(
    @GetUserId() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.tasksService.toggle(userId, id);
    return {
      success: true,
      message: 'Task toggled successfully',
      data: data,
    };
  }
}
