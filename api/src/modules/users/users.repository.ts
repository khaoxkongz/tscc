import { Database } from '@tscc/core';

import { UserModel } from './users.model';

interface IUserRepositpry {
  getAll: () => Promise<UserModel[]>;
  get: (id: string) => Promise<UserModel | undefined>;
  create: (input: Omit<UserModel, 'id'>) => Promise<void>;
  update: (input: UserModel) => Promise<void>;
  delete: (id: string) => Promise<void>;
}

export class UserRepository implements IUserRepositpry {
  constructor(protected db: Database<UserModel>) {}

  public async getAll() {
    return this.db.readAll();
  }

  public async get(id: string) {
    return this.db.read(id);
  }

  public async create(input: Omit<UserModel, 'id'>) {
    return this.db.insert(input);
  }

  public async update(input: UserModel) {
    return this.db.update(input);
  }

  public async delete(id: string) {
    return this.db.delete(id);
  }
}
