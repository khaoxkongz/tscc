import { Router } from 'express';

import { userRoutes } from './modules/users';

const router = Router();

router.use('/users', userRoutes);

export default router;
