import { UserLogin,userRegistration,verifyToken,verifyEmail } from '@/controller';
import { Router } from 'express';

const router = Router();

router.post('/auth/registration', (req, res, next) => {
  userRegistration(req, res, next);
});

router.post('/auth/login', (req, res, next) => {
  UserLogin(req, res, next);
});

router.post('/auth/verify-token', (req, res, next) => {
  verifyToken(req, res, next);
});

router.post('/auth/verify-email', (req, res, next) => {
  verifyEmail(req, res, next);
});



export default router;

