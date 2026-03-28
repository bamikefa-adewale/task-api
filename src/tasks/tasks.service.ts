import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { ListTasksQueryDto, MAX_PAGE_SIZE } from './dto/list-tasks-query.dto';

export type TaskResponse = {
  id: string;
  title: string;
  done: boolean;
  createdAt: string;
  userId: string;
};

export type PaginatedTasksResponse = {
  items: TaskResponse[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  private toResponse(task: Task): TaskResponse {
    return {
      id: task.id,
      title: task.title,
      done: task.done,
      createdAt: task.createdAt.toISOString(),
      userId: task.userId,
    };
  }

  async list(
    userId: string,
    query: ListTasksQueryDto,
  ): Promise<PaginatedTasksResponse> {
    const page = query.page;
    const pageSize = Math.min(query.pageSize, MAX_PAGE_SIZE);

    const qb = this.taskRepository
      .createQueryBuilder('t')
      .where('t.userId = :userId', { userId });

    if (query.q?.length) {
      qb.andWhere('LOWER(t.title) LIKE LOWER(:q)', { q: `%${query.q}%` });
    }

    const total = await qb.clone().getCount();

    const rows = await qb
      .orderBy('t.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return {
      items: rows.map((t) => this.toResponse(t)),
      page,
      pageSize,
      total,
      totalPages,
    };
  }

  async create(userId: string, dto: CreateTaskDto): Promise<TaskResponse> {
    const task = this.taskRepository.create({
      title: dto.title,
      userId,
      done: false,
    });
    const saved = await this.taskRepository.save(task);
    return this.toResponse(saved);
  }

  async toggle(userId: string, id: string): Promise<TaskResponse> {
    const task = await this.taskRepository.findOne({
      where: { id, userId },
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    task.done = !task.done;
    const saved = await this.taskRepository.save(task);
    return this.toResponse(saved);
  }
}
