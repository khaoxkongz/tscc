import { v4 as uuidv4 } from 'uuid';

import { Database, TypedRoutes } from '@tscc/core';

import { UserController } from './users.controller';
import { UserModel } from './users.model';
import { UserRepository } from './users.repository';

export const route = new TypedRoutes();
export const db = new Database<UserModel>('users', {
  defaultData: [
    {
      id: uuidv4(),
      username: 'firstuser',
      password: 'password',
      email: 'first@email.com',
    },
  ],
});

export const userRepository = new UserRepository(db);
export const userController = new UserController(userRepository);
