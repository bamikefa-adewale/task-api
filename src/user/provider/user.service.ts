import {
  Injectable,
  NotFoundException,
  RequestTimeoutException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { findOneByGoogleIdProvider } from 'src/user/provider/find-one-by-google-id.provider';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly findOneByGoogleIdProvider: findOneByGoogleIdProvider,
  ) {}

  async save(user: User): Promise<User> {
    return this.userRepository.save(user);
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create({
      ...createUserDto,
      authProvider: 'google',
    });
    return this.userRepository.save(user);
  }

  public async findOneByGoogleId(googleId: string) {
    return this.findOneByGoogleIdProvider.findOneByGoogleId(googleId);
  }

  public async findOneByEmail(email: string): Promise<User> {
    try {
      const user = await this.userRepository.findOneBy({ email });
      if (!user) {
        throw new NotFoundException(`User with email ${email} not found`);
      }
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Database query error:', error);
      throw new RequestTimeoutException(
        'Unable to process your request at the moment pleace try later ',
        {
          description: 'Error connecting to the database',
        },
      );
    }
  }

  async findOne(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return user;
  }
}
