import z from 'zod';

import { BaseController, HandlerMetadata } from '@tscc/core';

import { route } from './users.bootstrap';
import { UserRepository } from './users.repository';

interface IUserController {
  getAll: HandlerMetadata;
  get: HandlerMetadata;
  create: HandlerMetadata;
  update: HandlerMetadata;
  delete: HandlerMetadata;
}

export class UserController extends BaseController implements IUserController {
  constructor(private userRepository: UserRepository) {
    super();
  }

  /**
   * Read a list of users
   */
  public getAll = route.get('/').handler(async () => {
    return {
      data: await this.userRepository.getAll(),
    };
  });

  /**
   * Read a single user
   */
  public get = route
    .get('/:id')
    .params(z.object({ id: z.string() }))
    .handler(async ({ params }) => {
      const data = await this.userRepository.get(params.id);
      if (!data) throw new Error('User not found');
      return {
        data,
      };
    });

  /**
   * Create a new user
   */
  public create = route
    .post('/')
    .body(
      z.object({
        username: z.string(),
        email: z.string().email(),
        password: z.string(),
      })
    )
    .handler(async ({ body }) => {
      await this.userRepository.create(body);
      return {
        message: 'User created successfully',
      };
    });

  /**
   * Update a user
   */

  public update = route
    .put('/:id')
    .params(z.object({ id: z.string() }))
    .body(
      z.object({
        username: z.string(),
        email: z.string().email(),
        password: z.string(),
      })
    )
    .handler(async ({ params, body }) => {
      await this.userRepository.update({
        ...body,
        id: params.id,
      });
      return {
        message: 'User updated successfully',
      };
    });

  /**
   * Delete a user
   */
  public delete = route
    .delete('/:id')
    .params(z.object({ id: z.string() }))
    .handler(async ({ params }) => {
      await this.userRepository.delete(params.id);
      return {
        message: 'User deleted successfully',
      };
    });
}
