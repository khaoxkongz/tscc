import { BaseRouter } from '@tscc/core';

import { userController } from './users.bootstrap';

export default new BaseRouter().registerClassRoutes(userController).instance;
