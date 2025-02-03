import { createUser } from '@/controller';
import { Router } from 'express';

const router = Router();

router.post('/users', (req, res, next) => {
  createUser(req, res, next);
});

export default router;

