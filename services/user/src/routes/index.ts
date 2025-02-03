import { createUser, getUserById } from '@/controller';
import { Router } from 'express';

const router = Router();

router.post('/users', (req, res, next) => {
  createUser(req, res, next);
});

router.get('/users/:id', (req, res, next) => {
  getUserById(req, res, next);
});

export default router;

