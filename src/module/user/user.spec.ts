import { Test, TestingModule } from '@nestjs/testing';
import { UserApp } from './user';

describe('User', () => {
  let provider: UserApp;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserApp],
    }).compile();

    provider = module.get<UserApp>(UserApp);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
