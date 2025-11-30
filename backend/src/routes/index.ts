import { Router } from 'express';
import adminRoutes from './adminRoute.js';
import authRoutes from './authRoute.js';
import categoriesRoutes from './categoriesRoute.js';
import commentsRoutes from './commentsRoute.js';
import postsRoutes from './postsRoute.js';
import usersRoutes from './usersRoute.js';
import passwordRoutes from './passwordRoute.js';

const rootRouter: Router = Router();

rootRouter.use('/admin', adminRoutes);
rootRouter.use('/auth', authRoutes);
rootRouter.use('/categories', categoriesRoutes);
rootRouter.use('/comments', commentsRoutes);
rootRouter.use('/password', passwordRoutes);
rootRouter.use('/posts', postsRoutes);
rootRouter.use('/users', usersRoutes);

export default rootRouter;
