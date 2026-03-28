import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
@Injectable()
export class findOneByGoogleIdProvider {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  public async findOneByGoogleId(googleId: string): Promise<User | null> {
    const user = await this.userRepository.findOneBy({ googleId });
    return user;
  }
}
